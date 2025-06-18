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

  // [1. Cria embed inicial sem o ID da mensagem]
  const embedSemId = gerarEmbedInicial(prize, winnerCount, endTime, null);
  const components = gerarComponentesInterativos();

  // [2. Envia a mensagem]
  const message = await channel.send({
    embeds: [embedSemId],
    components: [components],
  });

  // [3. Recria embed com o ID agora disponível]
  const embedComId = gerarEmbedInicial(prize, winnerCount, endTime, message.id);

  // [4. Edita a mesma mensagem adicionando o ID]
  await message.edit({
    embeds: [embedComId],
    components,
  });

  // [5. Salva no banco de dados]
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

    const embedFinal = gerarEmbedFinal(sorteio.prize, total, winners.map(id => `<@${id}>`));
    const mensagemFinal = gerarMensagemVencedores(winners.map(id => `<@${id}>`), sorteio.prize);

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
