"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const Logger = require("@logger");

/**
 * Percorre diretórios recursivamente e retorna todos os arquivos .js
 */
async function getButtonFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  const files = await Promise.all(
    entries.map(entry => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return getButtonFiles(fullPath);
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
 * Carrega todos os botões e registra no client.
 * @param {import("discord.js").Client} client
 */
async function loadButtonInteractions(client) {
  const start = Date.now();

  const buttonsPath = path.join(
    __dirname,
    "../../../src/interactions/buttons"
  );

  if (!client.buttons) client.buttons = new Map();

  try {
    const files = await getButtonFiles(buttonsPath);

    if (files.length === 0) {
      Logger.warn("[BUTTON] Nenhum botão encontrado.");
      return;
    }

    let loaded = 0;
    let skipped = 0;

    for (const filePath of files) {
      try {
        delete require.cache[require.resolve(filePath)];

        const raw = require(filePath);
        const button = raw?.default || raw;

        if (!button?.customId || typeof button?.execute !== "function") {
          Logger.warn(
            `[BUTTON] Ignorado (estrutura inválida): ${path.basename(filePath)}`
          );
          skipped++;
          continue;
        }

        client.buttons.set(button.customId, button);

        Logger.success(`[BUTTON] Carregado: ${button.customId}`);
        loaded++;
      } catch (err) {
        Logger.error(
          `[BUTTON] Falha ao carregar ${path.basename(filePath)}\n${err.stack || err.message}`
        );
      }
    }

    const duration = Date.now() - start;

    Logger.info(
      `[BUTTON] Concluído: ${loaded} carregados | ${skipped} ignorados | ${duration}ms`
    );
  } catch (err) {
    Logger.error(
      `[BUTTON] Falha crítica ao ler diretório de botões\n${err.stack || err.message}`
    );
  }
}

module.exports = {
  loadButtonInteractions
};
