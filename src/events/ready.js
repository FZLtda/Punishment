"use strict";

const { 
  setBotPresence, 
  Monitor, 
} = require("@core");
const Logger = require("@logger");
const { 
  iniciarSorteiosTask, 
  iniciarAtribuicaoDeDoadores, 
} = require("@tasks");
const { sendBotData } = require("@jobs/sendBotData");

module.exports = {
  name: "ready",
  once: true,

  async execute(client) {
    Logger.info(`[Ready] Inicializando com usuário: ${client.user?.tag || "desconhecido"}`);

    if (!client.isReady()) {
      Logger.warn("[Ready] Client não está marcado como pronto.");
      return;
    }

    try {
      await setBotPresence(client, "ready");

      await Promise.allSettled([
        iniciarSorteiosTask(client),
        iniciarAtribuicaoDeDoadores(client)
      ]);

      await sendBotData(client);

      if (!client.statusInterval) {
        client.statusInterval = setInterval(async () => {
          await sendBotData(client);
        }, 60000);
      }

      Monitor.emit("ready", client.user.tag);
      
      Logger.info("[Ready] Inicialização concluída com sucesso.");

    } catch (err) {
      Logger.fatal(`[Ready] Falha durante inicialização: ${err.stack || err.message}`);
      Monitor.emit("error", "event:ready", err);
    }
  }
};
