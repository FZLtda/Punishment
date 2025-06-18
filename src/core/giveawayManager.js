const GiveawayModel = require('../models/Giveaway');
const {
  gerarEmbedInicial,
  gerarComponentesInterativos,
  gerarEmbedFinal,
  gerarMensagemVencedores,
} = require('../utils/giveawayUtils');

async function criarSorteio({ client, guild, channel, durationMs, winnerCount, prize, hostId }) {
  const endTime = Date.now() + durationMs;
  const embed = gerarEmbedInicial(prize, winnerCount, endTime);
  const components = gerarComponentesInterativos();

  const message = await channel.send({ embeds: [embed], components: [components] });

  // [Salvar sorteio no MongoDB] FZ
  await GiveawayModel.create({
    messageId: message.id,
    channelId: channel.id,
    guildId: guild.id,
    prize,
    winnerCount,
    endsAt: new Date(endTime),
    createdAt: new Date(),
    hostId,
    participants: [],
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

    const participantes = sorteio.participants;
    const total = participantes.length;
    const winners = [];

    const canal = await client.channels.fetch(sorteio.channelId).catch(() => null);
    if (!canal) return;

    const mensagem = await canal.messages.fetch(sorteio.messageId).catch(() => null);
    if (!mensagem) return;

    // [Selecionar ganhadores aleatórios] FZ
    for (let i = 0; i < sorteio.winnerCount && participantes.length > 0; i++) {
      const index = Math.floor(Math.random() * participantes.length);
      winners.push(`<@${participantes.splice(index, 1)}>`); 
    }

    const embedFinal = gerarEmbedFinal(sorteio.prize, total, winners);
    const mensagemFinal = gerarMensagemVencedores(winners, sorteio.prize);

    await mensagem.edit({ embeds: [embedFinal], components: [] });
    await canal.send(mensagemFinal);

    // [Marcar sorteio como encerrado no banco] FZ
    sorteio.ended = true;
    sorteio.participants = participantes; // [Atualiza lista final sem os ganhadores sorteados] FZ
    await sorteio.save();
  } catch (err) {
    console.error(`[ERRO] Finalizando sorteio: ${err}`);
  }
}

module.exports = {
  criarSorteio,
  agendarEncerramento,
  finalizarSorteio,
};
