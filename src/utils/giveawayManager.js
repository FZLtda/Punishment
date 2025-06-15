const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { red } = require('../config/colors.json');
const { attent } = require('../config/emoji.json');
const db = require('../data/database');

async function createGiveaway({ client, guild, channel, durationMs, winnerCount, prize }) {
  const endTime = Date.now() + durationMs;

  const embed = new EmbedBuilder()
    .setTitle('Novo Sorteio')
    .setDescription(`**Prêmio:** \`${prize}\`\n**Ganhador(es):** \`${winnerCount}\`\n**Termina:** <t:${Math.floor(endTime / 1000)}:f> (<t:${Math.floor(endTime / 1000)}:R>)`)
    .setColor(red)
    .setFooter({ text: 'Clique no botão para participar!' });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('participar').setLabel('🎟 Participar').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('ver_participantes').setLabel('👥 Participantes: 0').setStyle(ButtonStyle.Secondary).setDisabled(true)
  );

  const message = await channel.send({ embeds: [embed], components: [row] });

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

  return message;
}

function scheduleGiveawayEnd({ messageId, guildId, client, timeout }) {
  setTimeout(() => finalizeGiveaway(messageId, guildId, client), timeout);
}

async function finalizeGiveaway(messageId, guildId, client) {
  const giveaway = db.prepare('SELECT * FROM giveaways WHERE message_id = ?').get(messageId);
  if (!giveaway) return;

  const participants = JSON.parse(giveaway.participants);
  const total = participants.length;
  const winners = [];

  try {
    const channel = await client.channels.fetch(giveaway.channel_id);
    if (!channel) return;

    const message = await channel.messages.fetch(giveaway.message_id);
    if (!message) return;

    for (let i = 0; i < giveaway.winners && participants.length > 0; i++) {
      const idx = Math.floor(Math.random() * participants.length);
      winners.push(`<@${participants.splice(idx, 1)}>`);
    }

    const resultEmbed = new EmbedBuilder()
      .setTitle('Sorteio Finalizado')
      .setDescription(`**Prêmio:** \`${giveaway.prize}\`\n**Participantes:** \`${total}\`\n**Ganhador(es):** ${winners.length ? winners.join(', ') : '`Nenhum vencedor`'}`)
      .setColor(red)
      .setFooter({ text: 'Sorteio encerrado!' });

    const resultMessage = winners.length
      ? `🎉 Parabéns ${winners.join(', ')}! Vocês ganharam o **${giveaway.prize}**!`
      : `${attent} Nenhum vencedor foi escolhido porque ninguém participou.`;

    await message.edit({ embeds: [resultEmbed], components: [] });
    await channel.send(resultMessage);
    db.prepare('DELETE FROM giveaways WHERE message_id = ?').run(messageId);
  } catch (err) {
    console.error(`[ERRO] Finalizando sorteio: ${err}`);
  }
}

module.exports = {
  createGiveaway,
  scheduleGiveawayEnd
};
