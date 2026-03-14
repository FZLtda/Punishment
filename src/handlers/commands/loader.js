"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const Logger = require("@logger");

/**
 * Percorre diretórios recursivamente e retorna todos os arquivos .js
 */
async function getCommandFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  const files = await Promise.all(
    entries.map(entry => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return getCommandFiles(fullPath);
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
 * Carrega comandos de prefixo
 * @param {import("discord.js").Client} client
 */
async function loadCommands(client) {
  if (!client?.commands) {
    throw new Error(
      "[loadCommands] Erro crítico: client.commands não foi inicializado."
    );
  }

  const start = Date.now();

  const commandsPath = path.join(__dirname, "../../../src/commands");

  try {
    const files = await getCommandFiles(commandsPath);

    let loaded = 0;
    let skipped = 0;

    for (const filePath of files) {
      try {
        delete require.cache[require.resolve(filePath)];

        const command = require(filePath);

        // Ignora Slash Commands
        if (command?.data) {
          skipped++;
          continue;
        }

        // Ignora Context Commands
        if (command?.type === "context") {
          skipped++;
          continue;
        }

        // Ignora comandos que não são prefix
        if (!command?.name || typeof command?.execute !== "function") {
          Logger.warn(
            `[loadCommands] Estrutura inválida ignorada: ${path.relative(
              commandsPath,
              filePath
            )}`
          );
          skipped++;
          continue;
        }

        client.commands.set(command.name, command);
        loaded++;

        Logger.info(
          `[loadCommands] Prefix carregado: ${command.name}`
        );
      } catch (err) {
        Logger.error(
          `[loadCommands] Falha ao carregar ${filePath}\n${err.stack || err.message}`
        );
      }
    }

    const duration = Date.now() - start;

    Logger.info(
      `[loadCommands] Concluído: ${loaded} carregados | ${skipped} ignorados | ${duration}ms`
    );
  } catch (err) {
    Logger.error(
      `[loadCommands] Falha crítica ao ler diretório de comandos\n${err.stack || err.message}`
    );
  }
}

module.exports = {
  loadCommands
};
