"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const { Collection, ApplicationCommandType } = require("discord.js");
const Logger = require("@logger");

/**
 * Percorre diretórios recursivamente e retorna todos os arquivos .js
 */
async function getContextFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  const files = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return getContextFiles(fullPath);
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
 * Carrega comandos de Context Menu (Apps)
 * @param {import("discord.js").Client} client
 */
async function loadContext(client) {
  // Inicializa a collection se não existir (evita crash no bootstrap)
  if (!client.contextCommands) {
    client.contextCommands = new Collection();
  }

  const start = Date.now();
  const contextPath = path.join(__dirname, "../../../src/interactions/context");

  try {
    const files = await getContextFiles(contextPath);

    let loaded = 0;
    let skipped = 0;

    for (const filePath of files) {
      try {
        delete require.cache[require.resolve(filePath)];

        const command = require(filePath);

        // Valida se é um Context Command válido (Type 2 ou 3)
        const isContext = 
          command?.type === ApplicationCommandType.Message || 
          command?.type === ApplicationCommandType.User;

        if (!command?.name || !isContext) {
          Logger.warn(
            `[loadContext] Estrutura inválida ignorada: ${path.relative(
              contextPath,
              filePath
            )}`
          );
          skipped++;
          continue;
        }

        client.contextCommands.set(command.name, command);
        loaded++;

        Logger.info(`[loadContext] Context carregado: ${command.name}`);
      } catch (err) {
        Logger.error(
          `[loadContext] Falha ao carregar ${filePath}\n${err.stack || err.message}`
        );
      }
    }

    const duration = Date.now() - start;

    Logger.info(
      `[loadContext] Concluído: ${loaded} carregados | ${skipped} ignorados | ${duration}ms`
    );
  } catch (err) {
    // Se a pasta não existir, apenas avisa (não quebra o bot)
    Logger.warn(`[loadContext] Diretório de contexto não encontrado em: ${contextPath}`);
  }
}

module.exports = {
  loadContext
};
