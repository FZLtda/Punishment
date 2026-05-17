"use strict";

const { Giveaway } = require("@models");
const { finalizarSorteio } = require("@utils/sorteios");
const Logger = require("@logger");

module.exports = (client) => {
  if (client.giveawayTaskRunning) {
    Logger.warn("[SORTEIO] Task já está em execução.");
    return;
  }

  let executando = false;

  const executar = async () => {
    if (executando) {
      Logger.warn("[SORTEIO] Execução anterior ainda em andamento.");
      return;
    }

    executando = true;

    const start = Date.now();

    try {
      const agora = new Date();

      let sorteios;

      try {
        sorteios = await Giveaway.find({
          endsAt: { $lte: agora },
          status: "ativo"
        });
      } catch (err) {
        Logger.error(
          `[SORTEIO] Erro ao buscar sorteios pendentes: ${
            err.stack || err.message
          }`
        );
        return;
      }

      if (!sorteios.length) return;

      Logger.info(
        `[SORTEIO] Finalizando ${sorteios.length} sorteio(s) agendado(s)...`
      );

      for (const sorteio of sorteios) {
        try {
          await Giveaway.updateOne(
            { _id: sorteio._id, status: "ativo" },
            { $set: { status: "encerrando" } }
          );

          await finalizarSorteio(sorteio, client);

          await Giveaway.updateOne(
            { _id: sorteio._id },
            {
              $set: {
                status: "finalizado",
                endedAt: new Date()
              }
            }
          );

          Logger.info(
            `Sorteio encerrado automaticamente: "${sorteio.prize}" | ID: ${sorteio.messageId} | Guild: ${sorteio.guildId}`
          );

        } catch (err) {
          if (
            err.code === 10008 ||
            err.message === "GIVEAWAY_MESSAGE_DELETED"
          ) {
            await Giveaway.updateOne(
              { _id: sorteio._id },
              {
                $set: {
                  status: "cancelado",
                  cancelReason: "MESSAGE_DELETED",
                  endedAt: new Date()
                }
              }
            );

            Logger.warn(
              `[SORTEIO] Mensagem do sorteio apagada. Sorteio cancelado | ID: ${sorteio.messageId}`
            );

            continue;
          }

          await Giveaway.updateOne(
            { _id: sorteio._id },
            { $set: { status: "erro" } }
          );

          Logger.error(
            `Erro ao encerrar sorteio "${sorteio.prize}" (${sorteio.messageId}): ${
              err.stack || err.message
            }`
          );
        }
      }

    } finally {
      executando = false;

      const ms = Date.now() - start;
      Logger.info(`[SORTEIO] Ciclo finalizado em ${ms}ms`);
    }
  };

  executar();

  client.giveawayTaskRunning = setInterval(executar, 60 * 1000);

  Logger.info("[SORTEIO] Task de sorteios iniciada com segurança.");
};
