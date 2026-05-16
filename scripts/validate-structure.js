"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default || require("@babel/traverse"); // compatibilidade

function parseFileToAST(code) {
  return parser.parse(code, {
    sourceType: "unambiguous",
    plugins: [
      "jsx",
      "classProperties",
      "dynamicImport",
      "optionalChaining",
      "nullishCoalescingOperator",
      "topLevelAwait",
    ],
  });
}

async function findFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = [];
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        files.push(...(await findFiles(full)));
        continue;
      }
      if (e.isFile() && path.extname(e.name).toLowerCase() === ".js") files.push(full);
    }
    return files;
  } catch (err) {
    return [];
  }
}

/**
 * Summarize an AST node into a small shape descriptor used by validators.
 * Recognizes:
 *  - object literals (ObjectExpression) -> { type: "object", props: [...] }
 *  - builders/new expressions (NewExpression / CallExpression wrapping NewExpression) -> { type: "builder", callee: "Name" }
 *  - functions -> { type: "function" }
 *  - literals -> { type: "literal", value }
 *  - identifiers -> { type: "identifier", name }
 *  - fallback -> { type: "unknown" }
 */
function summarizeNode(node) {
  if (!node) return { type: "unknown" };

  // Object literal: module.exports = { ... }
  if (node.type === "ObjectExpression") {
    const props = node.properties
      .filter((p) => p && p.key && (p.key.name || (p.key.value && String(p.key.value))))
      .map((p) => (p.key && p.key.name ? p.key.name : String(p.key && p.key.value)));
    return { type: "object", props };
  }

  // New expression: new SlashCommandBuilder()
  if (node.type === "NewExpression") {
    const calleeName = node.callee && node.callee.name ? node.callee.name : null;
    return { type: "builder", callee: calleeName || "unknown" };
  }

  // Call expression that may wrap a NewExpression, e.g.:
  // new SlashCommandBuilder().setName(...).setDescription(...)
  if (node.type === "CallExpression") {
    const callee = node.callee;
    // direct chained call: MemberExpression whose object is NewExpression
    if (callee && callee.type === "MemberExpression") {
      const obj = callee.object;
      if (obj && obj.type === "NewExpression") {
        const calleeName = obj.callee && obj.callee.name ? obj.callee.name : null;
        return { type: "builder", callee: calleeName || "unknown" };
      }
      // nested chained calls: object is CallExpression wrapping MemberExpression -> NewExpression
      if (obj && obj.type === "CallExpression") {
        // try to find NewExpression inside nested structure
        let inner = obj;
        while (inner && inner.type === "CallExpression") {
          const innerCallee = inner.callee;
          if (innerCallee && innerCallee.type === "MemberExpression") {
            const innerObj = innerCallee.object;
            if (innerObj && innerObj.type === "NewExpression") {
              const calleeName = innerObj.callee && innerObj.callee.name ? innerObj.callee.name : null;
              return { type: "builder", callee: calleeName || "unknown" };
            }
            inner = innerObj;
          } else {
            break;
          }
        }
      }
    }
    // direct call of a NewExpression (rare): (new X)()
    if (callee && callee.type === "NewExpression") {
      const calleeName = callee.callee && callee.callee.name ? callee.callee.name : null;
      return { type: "builder", callee: calleeName || "unknown" };
    }
  }

  // Functions
  if (["FunctionExpression", "ArrowFunctionExpression", "FunctionDeclaration"].includes(node.type)) {
    return { type: "function" };
  }

  // Literals
  if (["StringLiteral", "NumericLiteral", "BooleanLiteral", "Literal"].includes(node.type)) {
    return { type: "literal", value: node.value };
  }

  // Identifier (e.g., exported variable reference)
  if (node.type === "Identifier") {
    return { type: "identifier", name: node.name };
  }

  return { type: node.type || "unknown" };
}

function analyzeExports(ast) {
  const result = { exports: { default: null, named: {} } };

  traverse(ast, {
    AssignmentExpression(path) {
      const left = path.node.left;
      const right = path.node.right;

      // module.exports = ...
      if (
        left.type === "MemberExpression" &&
        left.object.type === "Identifier" &&
        left.object.name === "module" &&
        left.property.type === "Identifier" &&
        left.property.name === "exports"
      ) {
        result.exports.default = summarizeNode(right);
      }

      // exports.foo = ...
      if (
        left.type === "MemberExpression" &&
        left.object.type === "Identifier" &&
        left.object.name === "exports" &&
        left.property.type === "Identifier"
      ) {
        result.exports.named[left.property.name] = summarizeNode(right);
      }
    },

    ExportDefaultDeclaration(path) {
      result.exports.default = summarizeNode(path.node.declaration);
    },

    ExportNamedDeclaration(path) {
      if (path.node.declaration) {
        const decl = path.node.declaration;
        if (decl.type === "FunctionDeclaration" && decl.id && decl.id.name) {
          result.exports.named[decl.id.name] = { type: "function" };
        } else if (decl.type === "VariableDeclaration") {
          for (const d of decl.declarations) {
            if (d.id && d.id.name) {
              result.exports.named[d.id.name] = summarizeNode(d.init);
            }
          }
        }
      }
      if (path.node.specifiers && path.node.specifiers.length) {
        for (const s of path.node.specifiers) {
          if (s.exported && s.exported.name) {
            result.exports.named[s.exported.name] = { type: "reexport" };
          }
        }
      }
    },
  });

  return result;
}

function checkShapeForType(filePath, exportsInfo, check) {
  try {
    return check.validator(exportsInfo);
  } catch (err) {
    return { ok: false, reason: `validator threw: ${String(err)}` };
  }
}

function defaultValidators() {
  // helper to detect builder/new/object for a node descriptor
  const isDataLike = (nodeDesc) =>
    !!nodeDesc && (nodeDesc.type === "object" || nodeDesc.type === "builder" || nodeDesc.type === "new");

  return [
    {
      dirSuffix: "commands",
      type: "prefix command",
      validator: (exportsInfo) => {
        const obj = exportsInfo.exports.default?.type === "object" ? exportsInfo.exports.default : null;
        const named = exportsInfo.exports.named;
        const hasNameExecute =
          (obj && obj.props && obj.props.includes("name") && obj.props.includes("execute")) ||
          (named.name && named.execute) ||
          (named.default && named.default.type === "object" && named.default.props && named.default.props.includes("name") && named.default.props.includes("execute"));
        return { ok: !!hasNameExecute, reason: hasNameExecute ? undefined : "missing name or execute" };
      },
    },
    {
      dirSuffix: path.join("commands", "slash"),
      type: "slash command",
      validator: (exportsInfo) => {
        // Accept object with data+execute OR named data + execute OR builder/new used directly in data property
        const def = exportsInfo.exports.default;
        const named = exportsInfo.exports.named;

        const defIsObjectWithData =
          def && def.type === "object" && def.props && def.props.includes("data") && def.props.includes("execute");

        const namedDataIsOk =
          (named.data && (named.data.type === "object" || named.data.type === "builder" || named.data.type === "new") && named.execute) ||
          (named.default && named.default.type === "object" && named.default.props && named.default.props.includes("data") && named.default.props.includes("execute"));

        // If default export is an object, we already checked props above.
        // If default export itself is a builder/new (rare), accept it as data only if there's also an execute export (named or default object)
        const defIsBuilder = def && (def.type === "builder" || def.type === "new");

        const ok =
          defIsObjectWithData ||
          namedDataIsOk ||
          (defIsBuilder && (named.execute || (def.type === "object" && def.props && def.props.includes("execute"))));

        return { ok: !!ok, reason: ok ? undefined : "missing data or execute" };
      },
    },
    {
      dirSuffix: "events",
      type: "event",
      validator: (exportsInfo) => {
        const obj = exportsInfo.exports.default?.type === "object" ? exportsInfo.exports.default : null;
        const named = exportsInfo.exports.named;
        const ok =
          (obj && obj.props && obj.props.includes("name") && obj.props.includes("execute")) ||
          (named.name && named.execute);
        return { ok: !!ok, reason: ok ? undefined : "missing name or execute" };
      },
    },
    {
      dirSuffix: path.join("interactions", "buttons"),
      type: "button",
      validator: (exportsInfo) => {
        const obj = exportsInfo.exports.default?.type === "object" ? exportsInfo.exports.default : null;
        const named = exportsInfo.exports.named;
        const ok =
          (obj && obj.props && obj.props.includes("customId") && obj.props.includes("execute")) ||
          (named.customId && named.execute);
        return { ok: !!ok, reason: ok ? undefined : "missing customId or execute" };
      },
    },
    {
      dirSuffix: path.join("interactions", "menus"),
      type: "menu",
      validator: (exportsInfo) => {
        const obj = exportsInfo.exports.default?.type === "object" ? exportsInfo.exports.default : null;
        const named = exportsInfo.exports.named;
        const ok =
          (obj && obj.props && obj.props.includes("customId") && obj.props.includes("execute")) ||
          (named.customId && named.execute);
        return { ok: !!ok, reason: ok ? undefined : "missing customId or execute" };
      },
    },
    {
      dirSuffix: path.join("interactions", "modals"),
      type: "modal",
      validator: (exportsInfo) => {
        const obj = exportsInfo.exports.default?.type === "object" ? exportsInfo.exports.default : null;
        const named = exportsInfo.exports.named;
        const ok =
          (obj && obj.props && obj.props.includes("customId") && obj.props.includes("execute")) ||
          (named.customId && named.execute);
        return { ok: !!ok, reason: ok ? undefined : "missing customId or execute" };
      },
    },
  ];
}

async function validate() {
  const root = path.join(__dirname, "../src");
  const checks = defaultValidators();

  let failed = false;

  for (const check of checks) {
    const dir = path.join(root, check.dirSuffix);
    const files = await findFiles(dir);
    if (!files.length) {
      console.warn(`[validate-structure] No files found for ${check.type} in ${dir}`);
      continue;
    }

    for (const f of files) {
      let code;
      try {
        code = await fs.readFile(f, "utf8");
      } catch (err) {
        console.error(`[validate-structure] Cannot read ${f}: ${String(err)}`);
        failed = true;
        continue;
      }

      let ast;
      try {
        ast = parseFileToAST(code);
      } catch (err) {
        console.error(`[validate-structure] Parse error in ${f}: ${String(err)}`);
        failed = true;
        continue;
      }

      let exportsInfo;
      try {
        exportsInfo = analyzeExports(ast);
      } catch (err) {
        console.error(`[validate-structure] Analyze error in ${f}: ${String(err)}`);
        failed = true;
        continue;
      }

      const res = checkShapeForType(f, exportsInfo, check);
      if (!res.ok) {
        console.error(`[validate-structure] Invalid ${check.type} in ${path.relative(process.cwd(), f)}: ${res.reason}`);
        failed = true;
      }
    }
  }

  if (failed) {
    console.error("[validate-structure] Validation failed. See errors above.");
    process.exit(2);
  }

  console.info("[validate-structure] All structure checks passed (static analysis).");
  process.exit(0);
}

validate().catch((err) => {
  console.error("[validate-structure] Unexpected error:", err);
  process.exit(2);
});
