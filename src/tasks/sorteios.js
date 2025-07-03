'use strict';

const Giveaway = require('@models/Giveaway');
const { finalizarSorteio } = require('@utils/sorteios');
const Logger = require('@logger');

/**
 * Executa a cada 60 segundos e finaliza sorteios vencidos automaticamente.
 * @param {import('discord.js').Client} client
 */
module.exports = (client) => {
  setInterval(async () => {
    const agora = new Date();

    try {
      const sorteiosPendentes = await Giveaway.find({
        endsAt: { $lte: agora },
        status: 'ativo'
      });

      if (sorteiosPendentes.length > 0) {
        Logger.info(`Finalizando ${sorteiosPendentes.length} sorteio(s) agendado(s)...`);
      }

      for (const sorteio of sorteiosPendentes) {
        try {
          await finalizarSorteio(sorteio, client);

          Logger.info(`Sorteio encerrado automaticamente: "${sorteio.prize}" | ID: ${sorteio.messageId} | Guild: ${sorteio.guildId}`);
        } catch (err) {
          Logger.error(`Erro ao encerrar sorteio "${sorteio.prize}" (${sorteio.messageId}): ${err.stack || err.message}`);
        }
      }

    } catch (err) {
      Logger.error(`Erro fatal ao buscar sorteios pendentes: ${err.stack || err.message}`);
    }
  }, 60 * 1000);
};
