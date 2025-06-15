const db = require('../data/database');
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

  db.prepare(`
    INSERT INTO giveaways (guild_id, channel_id, message_id, prize, duration, winners, end_time, participants)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    guild.id,
    channel.id,
    message.id,
    prize,
    durationMs,
    winnerCount,
    endTime,
    JSON.stringify([])
  );

  return { message, endTime };
}

function agendarEncerramento({ messageId, guildId, client, timeout }) {
  setTimeout(() => finalizarSorteio(messageId, guildId, client), timeout);
}

async function finalizarSorteio(messageId, guildId, client) {
  const sorteio = db.prepare('SELECT * FROM giveaways WHERE message_id = ?').get(messageId);
  if (!sorteio) return;

  const participantes = JSON.parse(sorteio.participants);
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

    db.prepare('DELETE FROM giveaways WHERE message_id = ?').run(messageId);
  } catch (err) {
    console.error(`[ERRO] Finalizando sorteio: ${err}`);
  }
}

module.exports = {
  criarSorteio,
  agendarEncerramento,
  finalizarSorteio,
};
