"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const { Collection } = require("discord.js");
const Logger = require("@logger");

/**
 * Percorre diretórios recursivamente e retorna todos os arquivos .js
 */
async function getModalFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  const files = await Promise.all(
    entries.map(entry => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return getModalFiles(fullPath);
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
 * Carrega todos os Modals personalizados e registra no client.
 * Suporta customId como string exata ou RegExp.
 * @param {import("discord.js").Client} client
 */
async function loadModals(client) {
  const start = Date.now();

  const modalsPath = path.resolve(
    __dirname,
    "../../../src/interactions/modals"
  );

  client.modals = new Collection();

  try {
    const files = await getModalFiles(modalsPath);

    if (files.length === 0) {
      Logger.warn("[MODAL] Nenhum modal encontrado.");
      return;
    }

    let loaded = 0;
    let skipped = 0;

    for (const filePath of files) {
      try {
        delete require.cache[require.resolve(filePath)];

        const raw = require(filePath);
        const modal = raw?.default || raw;

        const isValidCustomId =
          typeof modal?.customId === "string" ||
          modal?.customId instanceof RegExp;

        if (!isValidCustomId || typeof modal?.execute !== "function") {
          Logger.warn(
            `[MODAL] Ignorado (estrutura inválida): ${path.basename(filePath)}`
          );
          skipped++;
          continue;
        }

        client.modals.set(modal.customId, modal);

        Logger.info(`[MODAL] Carregado: ${modal.customId}`);
        loaded++;
      } catch (err) {
        Logger.error(
          `[MODAL] Falha ao carregar ${path.basename(filePath)}\n${err.stack || err.message}`
        );
      }
    }

    const duration = Date.now() - start;

    Logger.success(
      `[MODAL] Concluído: ${loaded} carregados | ${skipped} ignorados | ${duration}ms`
    );
  } catch (err) {
    Logger.error(
      `[MODAL] Falha crítica ao ler diretório de modals\n${err.stack || err.message}`
    );
  }
}

module.exports = {
  loadModals
};
