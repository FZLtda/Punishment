"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const { Collection, ApplicationCommandType, REST, Routes } = require("discord.js");
const Logger = require("@logger");

/**
 * Percorre diretórios recursivamente e retorna todos os arquivos .js
 */
async function getContextFiles(dir) {
  try {
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
  } catch {
    return [];
  }
}

/**
 * Carrega e Registra comandos de Context Menu (Apps)
 * @param {import("discord.js").Client} client
 */
async function loadContext(client) {
  if (!client.contextCommands) {
    client.contextCommands = new Collection();
  }

  const start = Date.now();
  const contextPath = path.join(__dirname, "../../../src/commands/context");
  const contextData = [];

  try {
    const files = await getContextFiles(contextPath);

    if (files.length === 0) {
      return Logger.warn(`[loadContext] Nenhum arquivo encontrado em: ${contextPath}`);
    }

    let loaded = 0;
    let skipped = 0;

    for (const filePath of files) {
      try {
        delete require.cache[require.resolve(filePath)];
        const command = require(filePath);

        const isContext = 
          command?.type === ApplicationCommandType.Message || 
          command?.type === ApplicationCommandType.User;

        if (!command?.name || !isContext) {
          Logger.warn(`[loadContext] Estrutura inválida ignorada: ${path.relative(contextPath, filePath)}`);
          skipped++;
          continue;
        }

        client.contextCommands.set(command.name, command);
        
        contextData.push({
          name: command.name,
          type: command.type
        });

        loaded++;
        Logger.info(`[loadContext] Context carregado: ${command.name}`);
      } catch (err) {
        Logger.error(`[loadContext] Falha ao carregar ${filePath}\n${err.stack || err.message}`);
      }
    }

    if (contextData.length > 0) {
      const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
      
      Logger.info(`[loadContext] Sincronizando ${contextData.length} comandos com o Discord...`);
      
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: contextData }
      );
      
      Logger.info("[loadContext] Sincronização concluída com sucesso!");
    }

    const duration = Date.now() - start;
    Logger.info(
      `[loadContext] Concluído: ${loaded} carregados | ${skipped} ignorados | ${duration}ms`
    );
  } catch (err) {
    Logger.error(`[loadContext] Falha crítica no loader de contexto:\n${err.stack || err.message}`);
  }
}

module.exports = {
  loadContext
};
