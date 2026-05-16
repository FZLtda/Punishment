"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const Logger = require("@logger");

async function getCommandFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        const nested = await getCommandFiles(fullPath);
        files.push(...nested);
        continue;
      }

      if (entry.isFile() && path.extname(entry.name).toLowerCase() === ".js") {
        files.push(fullPath);
      }
    }

    return files;
  } catch (err) {
    Logger.error(`[loadCommands] Falha ao ler diretório ${dir}:`, err);
    return [];
  }
}

function safeRequire(filePath) {
  try {
    const resolved = require.resolve(filePath);
    delete require.cache[resolved];
    return require(resolved);
  } catch (err) {
    Logger.error(`[loadCommands] Falha ao requerer ${path.basename(filePath)}:`, err);
    return undefined;
  }
}

async function loadCommands(client) {
  if (!client?.commands) {
    throw new Error("[loadCommands] Erro crítico: client.commands não foi inicializado.");
  }

  const start = Date.now();
  const commandsPath = path.join(__dirname, "../../../src/commands");

  try {
    const files = await getCommandFiles(commandsPath);

    let loaded = 0;
    let skipped = 0;

    for (const filePath of files) {
      try {
        const raw = safeRequire(filePath);
        if (!raw) {
          skipped++;
          continue;
        }

        const command = raw?.default ?? raw;

        if (command?.data) {
          skipped++;
          continue;
        }

        if (command?.type === "context") {
          skipped++;
          continue;
        }

        if (!command?.name || typeof command?.execute !== "function") {
          Logger.warn(
            `[loadCommands] Estrutura inválida ignorada: ${path.relative(commandsPath, filePath)}`
          );
          skipped++;
          continue;
        }

        client.commands.set(command.name, command);
        loaded++;

        Logger.info(`[loadCommands] Prefix carregado: ${command.name}`);
      } catch (err) {
        Logger.error(
          `[loadCommands] Falha ao processar ${path.relative(commandsPath, filePath)}:`,
          err
        );
      }
    }

    const duration = Date.now() - start;
    Logger.info(`[loadCommands] Concluído: ${loaded} carregados | ${skipped} ignorados | ${duration}ms`);
  } catch (err) {
    Logger.error("[loadCommands] Falha crítica ao ler diretório de comandos:", err);
  }
}

module.exports = {
  loadCommands
};
