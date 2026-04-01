"use strict";

const { readdirSync } = require("fs");
const path = require("path");

/**
 * @param {import("discord.js").Client} client 
 */
module.exports = (client) => {
  const contextPath = path.join(__dirname, "..", "commands", "context");
  
  // Verifica se a pasta existe antes de tentar ler
  try {
    const files = readdirSync(contextPath).filter(file => file.endsWith(".js"));

    for (const file of files) {
      const command = require(path.join(contextPath, file));

      if (command.name && command.type) {
        // Armazena no client para uso posterior no evento interactionCreate
        client.contextCommands.set(command.name, command);
        console.log(`[Context Loader] Comando carregado: ${command.name}`);
      }
    }
  } catch (error) {
    console.error("[Context Loader] Pasta de contexto não encontrada ou erro na leitura.");
  }
};

