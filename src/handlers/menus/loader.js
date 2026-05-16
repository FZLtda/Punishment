"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const { Collection } = require("discord.js");
const Logger = require("@logger");

async function getMenuFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        const nested = await getMenuFiles(fullPath);
        files.push(...nested);
        continue;
      }

      if (entry.isFile() && path.extname(entry.name).toLowerCase() === ".js") {
        files.push(fullPath);
      }
    }

    return files;
  } catch (err) {
    Logger.error(`[MENU] Falha ao ler diretório ${dir}:`, err);
    return [];
  }
}

function safeRequire(filePath) {
  try {
    const resolved = require.resolve(filePath);
    delete require.cache[resolved];
    return require(resolved);
  } catch (err) {
    Logger.error(`[MENU] Falha ao requerer ${path.basename(filePath)}:`, err);
    return undefined;
  }
}

async function loadMenus(client) {
  const start = Date.now();
  const menusPath = path.resolve(__dirname, "../../../src/interactions/menus");

  client.menus = new Collection();

  try {
    const files = await getMenuFiles(menusPath);

    if (!files || files.length === 0) {
      Logger.warn("[MENU] Nenhum Select Menu encontrado.");
      return;
    }

    let loaded = 0;
    let skipped = 0;

    for (const filePath of files) {
      try {
        const raw = safeRequire(filePath);
        if (!raw) {
          skipped++;
          continue;
        }

        const menu = raw?.default ?? raw;

        const isValidCustomId =
          typeof menu?.customId === "string" || menu?.customId instanceof RegExp;

        if (!isValidCustomId || typeof menu?.execute !== "function") {
          Logger.warn(`[MENU] Ignorado (estrutura inválida): ${path.basename(filePath)}`);
          skipped++;
          continue;
        }

        client.menus.set(menu.customId, menu);
        Logger.info(`[MENU] Carregado: ${menu.customId}`);
        loaded++;
      } catch (err) {
        Logger.error(
          `[MENU] Falha ao processar ${path.basename(filePath)}:`,
          err
        );
      }
    }

    const duration = Date.now() - start;
    Logger.success(`[MENU] Concluído: ${loaded} carregados | ${skipped} ignorados | ${duration}ms`);
  } catch (err) {
    Logger.error("[MENU] Falha crítica ao carregar menus:", err);
  }
}

module.exports = {
  loadMenus
};
