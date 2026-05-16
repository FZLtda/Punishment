"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const { Collection } = require("discord.js");
const Logger = require("@logger");

async function getModalFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        const nested = await getModalFiles(fullPath);
        files.push(...nested);
        continue;
      }

      if (entry.isFile() && path.extname(entry.name).toLowerCase() === ".js") {
        files.push(fullPath);
      }
    }

    return files;
  } catch (err) {
    Logger.error(`[MODAL] Falha ao ler diretório ${dir}:`, err);
    return [];
  }
}

function safeRequire(filePath) {
  try {
    const resolved = require.resolve(filePath);
    delete require.cache[resolved];
    return require(resolved);
  } catch (err) {
    Logger.error(`[MODAL] Falha ao requerer ${path.basename(filePath)}:`, err);
    return undefined;
  }
}

async function loadModals(client) {
  if (!client) {
    Logger.error("[MODAL] Client não fornecido.");
    return;
  }

  const start = Date.now();
  const modalsPath = path.resolve(__dirname, "../../../src/interactions/modals");

  client.modals = new Collection();

  try {
    const files = await getModalFiles(modalsPath);

    if (!files || files.length === 0) {
      Logger.warn("[MODAL] Nenhum modal encontrado.");
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

        const modal = raw?.default ?? raw;

        const isValidCustomId =
          typeof modal?.customId === "string" || modal?.customId instanceof RegExp;

        if (!isValidCustomId || typeof modal?.execute !== "function") {
          Logger.warn(`[MODAL] Ignorado (estrutura inválida): ${path.basename(filePath)}`);
          skipped++;
          continue;
        }

        client.modals.set(modal.customId, modal);
        Logger.info(`[MODAL] Carregado: ${modal.customId}`);
        loaded++;
      } catch (err) {
        Logger.error(
          `[MODAL] Falha ao processar ${path.basename(filePath)}:`,
          err
        );
        skipped++;
      }
    }

    const duration = Date.now() - start;
    Logger.success(`[MODAL] Concluído: ${loaded} carregados | ${skipped} ignorados | ${duration}ms`);
  } catch (err) {
    Logger.error("[MODAL] Falha crítica ao carregar modals:", err);
  }
}

module.exports = {
  loadModals
};
