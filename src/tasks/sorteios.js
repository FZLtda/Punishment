'use strict';

const Giveaway = require('@models/Giveaway');
const { finalizarSorteio } = require('@utils/sorteios');
const Logger = require('@logger'); 

module.exports = (client) => {
  setInterval(async () => {
    const agora = new Date();

    try {
      const pendentes = await Giveaway.find({
        endsAt: { $lte: agora },
        status: 'ativo'
      });

      for (const sorteio of pendentes) {
        await finalizarSorteio(sorteio, client);
        Logger.info(`[SORTEIO] Sorteio finalizado: "${sorteio.prize}" • ${sorteio.guildId}`);
      }
    } catch (err) {
      Logger.error(`[SORTEIO] Erro ao finalizar sorteios: ${err.stack || err.message}`);
    }
  }, 60 * 1000);
};
