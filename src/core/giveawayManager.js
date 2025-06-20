const GiveawayModel = require('../models/Giveaway');
const {
  gerarEmbedInicial,
  gerarEmbedFinal,
  gerarMensagemVencedores,
  gerarComponentesInterativos,
} = require('../utils/giveawayUtils');
const logger = require('../utils/logger');

async function criarSorteio({ client, guild, channel, durationMs, winnerCount, prize, hostId }) {
  const endTime = Date.now() + durationMs;

  const embed = gerarEmbedInicial(prize, winnerCount, endTime);
  const components = gerarComponentesInterativos(0);

  const message = await channel.send({ embeds: [embed], components: [components] });

  const giveaway = await GiveawayModel.create({
    messageId: message.id,
    channelId: channel.id,
    guildId: guild.id,
    prize,
    winnerCount,
    participants: [],
    winners: [],
    duration: durationMs,
    endsAt: new Date(endTime),
    createdAt: new Date(),
    hostId,
    ended: false,
  });

  agendarEncerramento({
    messageId: message.id,
    guildId: guild.id,
    client,
    timeout: durationMs,
  });

  return { message, endTime, giveaway };
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

    // Seleciona vencedores aleatórios
    for (let i = 0; i < sorteio.winnerCount && participantes.length > 0; i++) {
      const index = Math.floor(Math.random() * participantes.length);
      winners.push(participantes.splice(index, 1)[0]);
    }

    const embedFinal = gerarEmbedFinal(sorteio.prize, total, winners, sorteio.messageId, new Date());
    const mensagemFinal = gerarMensagemVencedores(winners, sorteio.prize);

    await mensagem.edit({ embeds: [embedFinal], components: [] });
    await canal.send(mensagemFinal);

    sorteio.ended = true;
    sorteio.winners = winners;
    await sorteio.save();

    logger.info(`🎉 Sorteio encerrado (${sorteio.messageId}) - Prêmio: ${sorteio.prize}`);
  } catch (err) {
    logger.error(`Erro ao finalizar sorteio (${messageId}): ${err.message}`, { stack: err.stack });
  }
}

module.exports = {
  criarSorteio,
  agendarEncerramento,
  finalizarSorteio,
};
