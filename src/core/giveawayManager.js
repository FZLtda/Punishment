const Giveaway = require('../models/Giveaway');
const {
  gerarEmbedInicial,
  gerarComponentesInterativos,
  gerarEmbedFinal,
  gerarMensagemVencedores,
} = require('../utils/giveawayUtils');

async function criarSorteio({ client, guild, channel, durationMs, winnerCount, prize }) {
  const endTime = Date.now() + durationMs;
  const embed = gerarEmbedInicial(prize, winnerCount, endTime);
  const components = gerarComponentesInterativos();

  const message = await channel.send({ embeds: [embed], components: [components] });

  const novoSorteio = new Giveaway({
    guild_id: guild.id,
    channel_id: channel.id,
    message_id: message.id,
    prize,
    duration: durationMs,
    winners: winnerCount,
    end_time: endTime,
    participants: [],
  });

  await novoSorteio.save(); // Salva no MongoDB

  return { message, endTime };
}

function agendarEncerramento({ messageId, guildId, client, timeout }) {
  setTimeout(() => finalizarSorteio(messageId, guildId, client), timeout);
}

async function finalizarSorteio(messageId, guildId, client) {
  const sorteio = await Giveaway.findOne({ message_id: messageId });
  if (!sorteio) return;

  const participantes = sorteio.participants || [];
  const total = participantes.length;
  const winners = [];

  try {
    const canal = await client.channels.fetch(sorteio.channel_id);
    if (!canal) return;

    const mensagem = await canal.messages.fetch(sorteio.message_id);
    if (!mensagem) return;

    for (let i = 0; i < sorteio.winners && participantes.length > 0; i++) {
      const index = Math.floor(Math.random() * participantes.length);
      winners.push(`<@${participantes.splice(index, 1)}>`); 
    }

    const embedFinal = gerarEmbedFinal(sorteio.prize, total, winners);
    const mensagemFinal = gerarMensagemVencedores(winners, sorteio.prize);

    await mensagem.edit({ embeds: [embedFinal], components: [] });
    await canal.send(mensagemFinal);

    await Giveaway.deleteOne({ message_id: messageId });
  } catch (err) {
    console.error(`[ERRO] Finalizando sorteio: ${err}`);
  }
}

module.exports = {
  criarSorteio,
  agendarEncerramento,
  finalizarSorteio,
};
