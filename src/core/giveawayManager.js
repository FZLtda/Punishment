const GiveawayModel = require('../models/Giveaway');
const {
  gerarEmbedInicial,
  gerarComponentesInterativos,
  gerarEmbedFinal,
  gerarMensagemVencedores,
} = require('../utils/giveawayUtils');
const logger = require('../utils/logger');

async function criarSorteio({ client, guild, channel, durationMs, winnerCount, prize, hostId }) {
  const endTime = Date.now() + durationMs;

  const embed = gerarEmbedInicial(prize, winnerCount, endTime);
  const components = gerarComponentesInterativos();

  const message = await channel.send({
    embeds: [embed],
    components: [components],
  });

  await GiveawayModel.create({
    messageId: message.id,
    channelId: channel.id,
    guildId: guild.id,
    prize,
    duration: durationMs,
    winnerCount,
    endsAt: new Date(endTime),
    createdAt: new Date(),
    hostId,
    participants: [],
    winners: [],
    ended: false,
  });

  return { message, endTime };
}

function agendarEncerramento({ messageId, guildId, client, timeout }) {
  setTimeout(() => finalizarSorteio(messageId, guildId, client), timeout);
}

async function finalizarSorteio(messageId, guildId, client) {
  try {
    const sorteio = await GiveawayModel.findOne({ messageId, guildId });
    if (!sorteio || sorteio.ended) return;

    const participantes = [...sorteio.participants];
    const total = participantes.length;
    const winners = [];

    const canal = await client.channels.fetch(sorteio.channelId).catch(() => null);
    if (!canal) return;

    const mensagem = await canal.messages.fetch(sorteio.messageId).catch(() => null);
    if (!mensagem) return;

    for (let i = 0; i < sorteio.winnerCount && participantes.length > 0; i++) {
      const index = Math.floor(Math.random() * participantes.length);
      const winnerId = participantes.splice(index, 1)[0];
      winners.push(winnerId);
    }

    if (winners.length < sorteio.winnerCount) {
      logger.warn(`Sorteio com menos ganhadores do que o esperado: ${winners.length}/${sorteio.winnerCount}`);
    }

    const embedFinal = gerarEmbedFinal(sorteio.prize, total, winners);
    const mensagemFinal = gerarMensagemVencedores(winners, sorteio.prize);

    await mensagem.edit({ embeds: [embedFinal], components: [] });
    await canal.send(mensagemFinal);

    sorteio.ended = true;
    sorteio.participants = participantes;
    sorteio.winners = winners;
    await sorteio.save();

    logger.info(`Sorteio finalizado: ${sorteio.prize} (${messageId})`);
  } catch (err) {
    logger.error(`Erro ao finalizar sorteio (${messageId}): ${err.message}`, { stack: err.stack });
  }
}

module.exports = {
  criarSorteio,
  agendarEncerramento,
  finalizarSorteio,
};
