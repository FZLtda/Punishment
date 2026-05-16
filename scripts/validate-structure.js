"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default || require("@babel/traverse"); // compatibilidade

function parseFileToAST(code) {
  return parser.parse(code, {
    sourceType: "unambiguous",
    plugins: ["jsx", "classProperties", "dynamicImport", "optionalChaining", "nullishCoalescingOperator"],
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

function analyzeExports(ast) {
  const result = { exports: { default: null, named: {} } };

  traverse(ast, {
    AssignmentExpression(path) {
      const left = path.node.left;
      const right = path.node.right;

      if (
        left.type === "MemberExpression" &&
        left.object.type === "Identifier" &&
        left.object.name === "module" &&
        left.property.type === "Identifier" &&
        left.property.name === "exports"
      ) {
        result.exports.default = summarizeNode(right);
      }

      if (
        left.type === "MemberExpression" &&
        left.object.type === "Identifier" &&
        left.object.name === "exports" &&
        left.property.type === "Identifier"
      ) {
        result.exports.named[left.property.name] = summarizeNode(right);
      }
    },

    ExpressionStatement(path) {
      const expr = path.node.expression;
      if (expr && expr.type === "AssignmentExpression") {
        // handled above
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

function summarizeNode(node) {
  if (!node) return { type: "unknown" };
  if (node.type === "ObjectExpression") {
    const props = node.properties
      .filter((p) => p.key && (p.key.name || (p.key.value && String(p.key.value))))
      .map((p) => (p.key.name ? p.key.name : String(p.key.value)));
    return { type: "object", props };
  }
  if (node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression" || node.type === "FunctionDeclaration") {
    return { type: "function" };
  }
  if (node.type === "Literal" || node.type === "StringLiteral" || node.type === "NumericLiteral" || node.type === "BooleanLiteral") {
    return { type: "literal", value: node.value };
  }
  if (node.type === "Identifier") {
    return { type: "identifier", name: node.name };
  }
  return { type: node.type || "unknown" };
}

function checkShapeForType(filePath, exportsInfo, check) {
  try {
    return check.validator(exportsInfo);
  } catch (err) {
    return { ok: false, reason: `validator threw: ${String(err)}` };
  }
}

function defaultValidators() {
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
        // expect data and execute
        const obj = exportsInfo.exports.default?.type === "object" ? exportsInfo.exports.default : null;
        const named = exportsInfo.exports.named;
        const ok =
          (obj && obj.props && obj.props.includes("data") && obj.props.includes("execute")) ||
          (named.data && named.execute) ||
          (named.default && named.default.type === "object" && named.default.props && named.default.props.includes("data") && named.default.props.includes("execute"));
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
