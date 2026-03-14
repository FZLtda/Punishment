"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const { Collection } = require("discord.js");
const Logger = require("@logger");

/**
 * Percorre diretórios recursivamente e retorna todos os arquivos .js
 */
async function getMenuFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  const files = await Promise.all(
    entries.map(entry => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return getMenuFiles(fullPath);
      }

      if (entry.isFile() && entry.name.endsWith(".js")) {
        return fullPath;
      }

      return [];
    })
  );

  return files.flat();
}

/**
 * Carrega todos os Select Menus personalizados e registra no client.
 * Suporta customId como string exata ou RegExp.
 * @param {import("discord.js").Client} client
 */
async function loadMenus(client) {
  const start = Date.now();

  const menusPath = path.resolve(
    __dirname,
    "../../../src/interactions/menus"
  );

  client.menus = new Collection();

  try {
    const files = await getMenuFiles(menusPath);

    if (files.length === 0) {
      Logger.warn("[MENU] Nenhum Select Menu encontrado.");
      return;
    }

    let loaded = 0;
    let skipped = 0;

    for (const filePath of files) {
      try {
        delete require.cache[require.resolve(filePath)];

        const raw = require(filePath);
        const menu = raw?.default || raw;

        const isValidCustomId =
          typeof menu?.customId === "string" ||
          menu?.customId instanceof RegExp;

        if (!isValidCustomId || typeof menu?.execute !== "function") {
          Logger.warn(
            `[MENU] Ignorado (estrutura inválida): ${path.basename(filePath)}`
          );
          skipped++;
          continue;
        }

        client.menus.set(menu.customId, menu);

        Logger.info(`[MENU] Carregado: ${menu.customId}`);
        loaded++;
      } catch (err) {
        Logger.error(
          `[MENU] Falha ao carregar ${path.basename(filePath)}\n${err.stack || err.message}`
        );
      }
    }

    const duration = Date.now() - start;

    Logger.success(
      `[MENU] Concluído: ${loaded} carregados | ${skipped} ignorados | ${duration}ms`
    );
  } catch (err) {
    Logger.error(
      `[MENU] Falha crítica ao ler diretório de menus\n${err.stack || err.message}`
    );
  }
}

module.exports = {
  loadMenus
};
