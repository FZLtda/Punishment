"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default || require("@babel/traverse");

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

    for (const entry of entries) {
      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        files.push(...(await findFiles(full)));
        continue;
      }

      if (entry.isFile() && path.extname(entry.name) === ".js") {
        files.push(full);
      }
    }

    return files;
  } catch {
    return [];
  }
}

function extractBuilder(node) {
  let current = node;

  while (current) {
    if (current.type === "NewExpression") {
      return current.callee?.name || "unknown";
    }

    if (current.type === "CallExpression") {
      current = current.callee?.object;
      continue;
    }

    if (current.type === "MemberExpression") {
      current = current.object;
      continue;
    }

    break;
  }

  return null;
}

function summarizeNode(node) {
  if (!node) {
    return { type: "unknown" };
  }

  // module.exports = { ... }
  if (node.type === "ObjectExpression") {
    const props = node.properties
      .filter((p) => p?.key)
      .map((p) => p.key.name || String(p.key.value));

    return {
      type: "object",
      props,
    };
  }

  // builders robustos
  if (
    node.type === "CallExpression" ||
    node.type === "MemberExpression" ||
    node.type === "NewExpression"
  ) {
    const builder = extractBuilder(node);

    if (builder) {
      return {
        type: "builder",
        callee: builder,
      };
    }
  }

  // funções
  if (
    [
      "FunctionExpression",
      "ArrowFunctionExpression",
      "FunctionDeclaration",
    ].includes(node.type)
  ) {
    return { type: "function" };
  }

  // literals
  if (
    [
      "StringLiteral",
      "NumericLiteral",
      "BooleanLiteral",
      "Literal",
    ].includes(node.type)
  ) {
    return {
      type: "literal",
      value: node.value,
    };
  }

  // identifiers
  if (node.type === "Identifier") {
    return {
      type: "identifier",
      name: node.name,
    };
  }

  return {
    type: node.type || "unknown",
  };
}

function analyzeExports(ast) {
  const result = {
    exports: {
      default: null,
      named: {},
    },
  };

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
        result.exports.named[left.property.name] =
          summarizeNode(right);
      }
    },

    ExportDefaultDeclaration(path) {
      result.exports.default =
        summarizeNode(path.node.declaration);
    },

    ExportNamedDeclaration(path) {
      const decl = path.node.declaration;

      if (decl) {
        if (
          decl.type === "FunctionDeclaration" &&
          decl.id?.name
        ) {
          result.exports.named[decl.id.name] = {
            type: "function",
          };
        }

        if (decl.type === "VariableDeclaration") {
          for (const d of decl.declarations) {
            if (d.id?.name) {
              result.exports.named[d.id.name] =
                summarizeNode(d.init);
            }
          }
        }
      }

      if (path.node.specifiers?.length) {
        for (const s of path.node.specifiers) {
          if (s.exported?.name) {
            result.exports.named[s.exported.name] = {
              type: "reexport",
            };
          }
        }
      }
    },
  });

  return result;
}

function checkShapeForType(exportsInfo, check) {
  try {
    return check.validator(exportsInfo);
  } catch (err) {
    return {
      ok: false,
      reason: `validator threw: ${String(err)}`,
    };
  }
}

function defaultValidators() {
  return [
    {
      dirSuffix: "commands",
      exclude: ["slash"],
      type: "prefix command",

      validator: (exportsInfo) => {
        const def = exportsInfo.exports.default;
        const named = exportsInfo.exports.named;

        const ok =
          (
            def?.type === "object" &&
            def.props?.includes("name") &&
            def.props?.includes("execute")
          ) ||
          (named.name && named.execute);

        return {
          ok,
          reason: ok
            ? undefined
            : "missing name or execute",
        };
      },
    },

    {
      dirSuffix: path.join("commands", "slash"),
      type: "slash command",

      validator: (exportsInfo) => {
        const def = exportsInfo.exports.default;
        const named = exportsInfo.exports.named;

        const ok =
          (
            def?.type === "object" &&
            def.props?.includes("data") &&
            def.props?.includes("execute")
          ) ||
          (
            named.data &&
            (
              named.data.type === "builder" ||
              named.data.type === "object"
            ) &&
            named.execute
          );

        return {
          ok,
          reason: ok
            ? undefined
            : "missing data or execute",
        };
      },
    },

    {
      dirSuffix: "events",
      type: "event",

      validator: (exportsInfo) => {
        const def = exportsInfo.exports.default;
        const named = exportsInfo.exports.named;

        const ok =
          (
            def?.type === "object" &&
            def.props?.includes("name") &&
            def.props?.includes("execute")
          ) ||
          (named.name && named.execute);

        return {
          ok,
          reason: ok
            ? undefined
            : "missing name or execute",
        };
      },
    },

    {
      dirSuffix: path.join("interactions", "buttons"),
      type: "button",

      validator: (exportsInfo) => {
        const def = exportsInfo.exports.default;
        const named = exportsInfo.exports.named;

        const ok =
          (
            def?.type === "object" &&
            def.props?.includes("customId") &&
            def.props?.includes("execute")
          ) ||
          (named.customId && named.execute);

        return {
          ok,
          reason: ok
            ? undefined
            : "missing customId or execute",
        };
      },
    },

    {
      dirSuffix: path.join("interactions", "menus"),
      type: "menu",

      validator: (exportsInfo) => {
        const def = exportsInfo.exports.default;
        const named = exportsInfo.exports.named;

        const ok =
          (
            def?.type === "object" &&
            def.props?.includes("customId") &&
            def.props?.includes("execute")
          ) ||
          (named.customId && named.execute);

        return {
          ok,
          reason: ok
            ? undefined
            : "missing customId or execute",
        };
      },
    },

    {
      dirSuffix: path.join("interactions", "modals"),
      type: "modal",

      validator: (exportsInfo) => {
        const def = exportsInfo.exports.default;
        const named = exportsInfo.exports.named;

        const ok =
          (
            def?.type === "object" &&
            def.props?.includes("customId") &&
            def.props?.includes("execute")
          ) ||
          (named.customId && named.execute);

        return {
          ok,
          reason: ok
            ? undefined
            : "missing customId or execute",
        };
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
      console.warn(
        `[validate-structure] No files found for ${check.type} in ${dir}`,
      );

      continue;
    }

    for (const file of files) {
      const relativePath = path.relative(dir, file);

      if (
        Array.isArray(check.exclude) &&
        check.exclude.some((excluded) =>
          relativePath.startsWith(excluded),
        )
      ) {
        continue;
      }

      let code;

      try {
        code = await fs.readFile(file, "utf8");
      } catch (err) {
        console.error(
          `[validate-structure] Cannot read ${file}: ${String(err)}`,
        );

        failed = true;
        continue;
      }

      let ast;

      try {
        ast = parseFileToAST(code);
      } catch (err) {
        console.error(
          `[validate-structure] Parse error in ${file}: ${String(err)}`,
        );

        failed = true;
        continue;
      }

      let exportsInfo;

      try {
        exportsInfo = analyzeExports(ast);
      } catch (err) {
        console.error(
          `[validate-structure] Analyze error in ${file}: ${String(err)}`,
        );

        failed = true;
        continue;
      }

      const result = checkShapeForType(
        exportsInfo,
        check,
      );

      if (!result.ok) {
        console.error(
          `[validate-structure] Invalid ${check.type} in ${path.relative(process.cwd(), file)}: ${result.reason}`,
        );

        failed = true;
      }
    }
  }

  if (failed) {
    console.error(
      "[validate-structure] Validation failed. See errors above.",
    );

    process.exit(2);
  }

  console.info(
    "[validate-structure] All structure checks passed (static analysis).",
  );

  process.exit(0);
}

validate().catch((err) => {
  console.error(
    "[validate-structure] Unexpected error:",
    err,
  );

  process.exit(2);
});
