"use strict";

const { PendingDonor } = require("@models");
const logger = require("@logger");

const INTERVALO = 60_000;
const CARGO_DOADOR_ID = process.env.CARGO_DOADOR_ID;
const GUILD_ID = process.env.GUILD_ID;

module.exports = function iniciarAtribuicaoDeDoadores(client) {
  setInterval(async () => {
    try {
      const guild = client.guilds.cache.get(GUILD_ID);
      if (!guild) return;

      const pendentes = await PendingDonor.find({});
      if (!pendentes.length) return;

      for (const { userId } of pendentes) {
        try {
          const member = await guild.members.fetch(userId).catch(() => null);
          if (!member) continue;

          await member.roles.add(CARGO_DOADOR_ID);
          await PendingDonor.deleteOne({ userId });

          logger.info(`[Doador] Cargo atribuído automaticamente a ${member.user.tag} (${userId})`);
        } catch (err) {
          logger.warn(`[Doador] Falha ao atribuir cargo a ${userId}: ${err.message}`);
        }
      }

    } catch (err) {
      logger.error(`[Doador] Erro na verificação de doadores pendentes: ${err.message}`);
    }
  }, INTERVALO);
};
