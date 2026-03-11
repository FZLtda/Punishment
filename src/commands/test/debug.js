"use strict";

const { bot } = require("@config");
const { sendWarning } = require("@embeds/embedWarning");
const Logger = require("@logger");

module.exports = {
  name: "debug",
  description: "Simula falhas controladas para testar o monitoramento do status.",
  usage: "${currentPrefix}debug <action>",
  category: "Dono",
  deleteMessage: true,

  /**
   * Comando de Debug para o Dono do Bot.
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
  async execute(message, args) {
    if (message.author.id !== bot.ownerId) return;

    const client = message.client;
    const action = args[0]?.toLowerCase();

    if (action === "fault_handler") {
      const originalCommands = client.commands;

      try {
        // Simula falha: Esvazia a coleção de comandos na memória do client
        // Isso fará o monitor.js reportar erro (size === 0) no próximo ciclo
        client.commands = new Map();

        Logger.warn(`[DEBUG] Simulação de falha no Interaction Engine iniciada por ${message.author.tag}`);
        
        message.channel.send("⚠️ **SIMULAÇÃO:** Interaction Engine (Command Handler) agora reportará FALHA ao Better Stack.\nRestaurando em **60 segundos**...");

        setTimeout(() => {
          client.commands = originalCommands;
          Logger.info("[DEBUG] Monitoramento do Interaction Engine restaurado com sucesso.");
          message.channel.send("✅ **RESTAURADO:** O Interaction Engine voltou ao normal.");
        }, 60000);

      } catch (error) {
        client.commands = originalCommands;
        Logger.error("[DEBUG] Erro ao executar simulação de falha:", error);
      }
      return;
    }

    return sendWarning(message, "Ações disponíveis: `fault_handler`");
  }
};
