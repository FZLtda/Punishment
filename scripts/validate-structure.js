"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const Logger = require(path.join(__dirname, "../src/logger"));

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

function safeRequire(filePath) {
  try {
    const resolved = require.resolve(filePath);
    delete require.cache[resolved];
    return require(resolved);
  } catch (err) {
    return { __requireError: err.message || String(err) };
  }
}

async function validate() {
  const root = path.join(__dirname, "../src");
  const checks = [
    { dir: path.join(root, "commands"), type: "prefix command", validator: (m) => m && m.name && typeof m.execute === "function" },
    { dir: path.join(root, "commands/slash"), type: "slash command", validator: (m) => m && m.data && typeof m.execute === "function" && typeof m.data.toJSON === "function" },
    { dir: path.join(root, "events"), type: "event", validator: (m) => m && m.name && typeof m.execute === "function" },
    { dir: path.join(root, "interactions/buttons"), type: "button", validator: (m) => m && m.customId && typeof m.execute === "function" },
    { dir: path.join(root, "interactions/menus"), type: "menu", validator: (m) => m && (typeof m.customId === "string" || m.customId instanceof RegExp) && typeof m.execute === "function" },
    { dir: path.join(root, "interactions/modals"), type: "modal", validator: (m) => m && (typeof m.customId === "string" || m.customId instanceof RegExp) && typeof m.execute === "function" },
  ];

  let failed = false;

  for (const check of checks) {
    const files = await findFiles(check.dir);
    if (!files.length) {
      Logger.warn(`[validate-structure] No files found for ${check.type} in ${check.dir}`);
      continue;
    }

    for (const f of files) {
      const raw = safeRequire(f);
      if (raw && raw.__requireError) {
        Logger.error(`[validate-structure] Require error in ${f}: ${raw.__requireError}`);
        failed = true;
        continue;
      }
      const mod = raw?.default ?? raw;
      if (!check.validator(mod)) {
        Logger.error(`[validate-structure] Invalid ${check.type} in ${path.relative(process.cwd(), f)}`);
        failed = true;
      }
    }
  }

  if (failed) {
    Logger.error("[validate-structure] Validation failed. See errors above.");
    process.exit(2);
  }

  Logger.info("[validate-structure] All structure checks passed.");
  process.exit(0);
}

validate();
