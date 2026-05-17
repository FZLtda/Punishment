"use strict";

const { PendingDonor } = require("@models");
const logger = require("@logger");

const INTERVALO = 60_000;

const CARGO_DOADOR_ID = process.env.CARGO_DOADOR_ID;
const GUILD_ID = process.env.GUILD_ID;

module.exports = function iniciarAtribuicaoDeDoadores(client) {
  if (client.pendingDonorTask) {
    logger.warn("[Doador] Task já está em execução.");
    return;
  }

  let executando = false;

  const executar = async () => {
    if (executando) {
      logger.warn("[Doador] Execução anterior ainda em andamento.");
      return;
    }

    executando = true;

    try {
      const guild = client.guilds.cache.get(GUILD_ID);

      if (!guild) {
        logger.warn("[Doador] Guild não encontrada.");
        return;
      }

      const pendentes = await PendingDonor.find({});

      if (!pendentes.length) {
        return;
      }

      logger.info(
        `[Doador] ${pendentes.length} doador(es) pendente(s) encontrado(s).`
      );

      for (const { userId } of pendentes) {
        try {
          const member = await guild.members
            .fetch(userId)
            .catch(() => null);

          if (!member) {
            logger.warn(
              `[Doador] Membro não encontrado: ${userId}`
            );

            continue;
          }

          if (member.roles.cache.has(CARGO_DOADOR_ID)) {
            await PendingDonor.deleteOne({ userId });

            logger.info(
              `[Doador] Usuário já possui o cargo: ${member.user.tag}`
            );

            continue;
          }

          await member.roles.add(CARGO_DOADOR_ID);

          await PendingDonor.deleteOne({ userId });

          logger.info(
            `[Doador] Cargo atribuído automaticamente a ${member.user.tag} (${userId})`
          );

        } catch (err) {
          logger.warn(
            `[Doador] Falha ao atribuir cargo a ${userId}: ${
              err.stack || err.message
            }`
          );
        }
      }

    } catch (err) {
      logger.error(
        `[Doador] Erro na verificação de doadores pendentes: ${
          err.stack || err.message
        }`
      );

    } finally {
      executando = false;
    }
  };

  executar();

  client.pendingDonorTask = setInterval(executar, INTERVALO);

  logger.info("[Doador] Task de atribuição iniciada.");
};
