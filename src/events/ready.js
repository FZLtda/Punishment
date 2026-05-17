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
    Logger.info(
      `[Ready] Inicializando com usuário: ${client.user?.tag || "desconhecido"}`
    );

    if (!client?.isReady?.()) {
      Logger.warn("[Ready] Client não está marcado como pronto.");
      return;
    }

    try {
      await setBotPresence(client, "ready");

      const tasks = [
        {
          name: "iniciarSorteiosTask",
          execute: iniciarSorteiosTask
        },
        {
          name: "iniciarAtribuicaoDeDoadores",
          execute: iniciarAtribuicaoDeDoadores
        }
      ];

      const results = await Promise.allSettled(
        tasks.map(async ({ name, execute }) => {
          if (typeof execute !== "function") {
            throw new TypeError(
              `[Ready] Task "${name}" não é uma função válida.`
            );
          }

          Logger.info(`[Ready] Iniciando task: ${name}`);

          await execute(client);

          Logger.info(`[Ready] Task iniciada com sucesso: ${name}`);
        })
      );

      for (const result of results) {
        if (result.status === "rejected") {
          Logger.error(
            `[Ready] Falha ao iniciar task: ${
              result.reason?.stack ||
              result.reason?.message ||
              result.reason
            }`
          );

          Monitor.emit(
            "error",
            "event:ready:task",
            result.reason
          );
        }
      }

      try {
        await sendBotData(client);
      } catch (err) {
        Logger.error(
          `[Ready] Falha ao enviar dados do bot: ${
            err.stack || err.message
          }`
        );
      }

      if (!client.statusInterval) {
        Logger.info("[Ready] Inicializando status interval.");

        client.statusInterval = setInterval(async () => {
          try {
            await sendBotData(client);
          } catch (err) {
            Logger.error(
              `[Ready] Erro no status interval: ${
                err.stack || err.message
              }`
            );
          }
        }, 60000);
      } else {
        Logger.warn("[Ready] Status interval já está ativo.");
      }

      Monitor.emit("ready", client.user.tag);

      Logger.info("[Ready] Inicialização concluída com sucesso.");

    } catch (err) {
      Logger.fatal(
        `[Ready] Falha durante inicialização: ${
          err.stack || err.message
        }`
      );

      Monitor.emit("error", "event:ready", err);
    }
  }
};
