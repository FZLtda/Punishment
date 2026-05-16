"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const Logger = require("@logger");

async function getButtonFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        const nested = await getButtonFiles(fullPath);
        files.push(...nested);
        continue;
      }

      if (entry.isFile() && path.extname(entry.name).toLowerCase() === ".js") {
        files.push(fullPath);
      }
    }

    return files;
  } catch (err) {
    Logger.error(`[BUTTON] Falha ao ler diretório ${dir}:`, err);
    return [];
  }
}

function safeRequire(filePath) {
  try {
    const resolved = require.resolve(filePath);
    delete require.cache[resolved];
    return require(resolved);
  } catch (err) {
    Logger.error(`[BUTTON] Falha ao requerer ${path.basename(filePath)}:`, err);
    return undefined;
  }
}

async function loadButtonInteractions(client) {
  const start = Date.now();

  const buttonsPath = path.join(__dirname, "../../../src/interactions/buttons");

  if (!client.buttons) client.buttons = new Map();

  try {
    const files = await getButtonFiles(buttonsPath);

    if (!files || files.length === 0) {
      Logger.warn("[BUTTON] Nenhum botão encontrado.");
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

        const button = raw?.default ?? raw;

        if (!button?.customId || typeof button?.execute !== "function") {
          Logger.warn(`[BUTTON] Ignorado (estrutura inválida): ${path.basename(filePath)}`);
          skipped++;
          continue;
        }

        client.buttons.set(button.customId, button);
        Logger.success(`[BUTTON] Carregado: ${button.customId}`);
        loaded++;
      } catch (err) {
        Logger.error(`[BUTTON] Falha ao processar ${path.basename(filePath)}:`, err);
      }
    }

    const duration = Date.now() - start;
    Logger.info(`[BUTTON] Concluído: ${loaded} carregados | ${skipped} ignorados | ${duration}ms`);
  } catch (err) {
    Logger.error("[BUTTON] Falha crítica ao carregar botões:", err);
  }
}

module.exports = {
  loadButtonInteractions
};
