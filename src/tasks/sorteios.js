'use strict';

const Giveaway = require('@models/Giveaway');
const { finalizarSorteio } = require('@utils/sorteios');
const Logger = require('@logger');

/**
 * Finaliza sorteios vencidos automaticamente.
 * Protegido contra flood quando a mensagem do sorteio não existe mais.
 *
 * @param {import('discord.js').Client} client
 */
module.exports = (client) => {
  setInterval(async () => {
    const agora = new Date();

    let sorteios;
    try {
      sorteios = await Giveaway.find({
        endsAt: { $lte: agora },
        status: 'ativo'
      });
    } catch (err) {
      Logger.error(
        `[SORTEIO] Erro ao buscar sorteios pendentes: ${err.stack || err.message}`
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
          { _id: sorteio._id, status: 'ativo' },
          { $set: { status: 'encerrando' } }
        );

        await finalizarSorteio(sorteio, client);

        await Giveaway.updateOne(
          { _id: sorteio._id },
          { $set: { status: 'finalizado', endedAt: new Date() } }
        );

        Logger.info(
          `Sorteio encerrado automaticamente: "${sorteio.prize}" | ID: ${sorteio.messageId} | Guild: ${sorteio.guildId}`
        );

      } catch (err) {
        if (err.code === 10008 || err.message === 'GIVEAWAY_MESSAGE_DELETED') {
          await Giveaway.updateOne(
            { _id: sorteio._id },
            {
              $set: {
                status: 'cancelado',
                cancelReason: 'MESSAGE_DELETED',
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
          { $set: { status: 'erro' } }
        );

        Logger.error(
          `Erro ao encerrar sorteio "${sorteio.prize}" (${sorteio.messageId}): ${err.stack || err.message}`
        );
      }
    }
  }, 60 * 1000);
};
