const db = require('../data/database');
const { EmbedBuilder } = require('discord.js');

async function finalizarSorteios(client) {
  const giveaways = db.prepare('SELECT * FROM giveaways WHERE end_time <= ?').all(Date.now());

  for (const giveaway of giveaways) {
    const channel = await client.channels.fetch(giveaway.channel_id).catch(() => null);
    if (!channel) continue;

    const message = await channel.messages.fetch(giveaway.message_id).catch(() => null);
    if (!message) continue;

    const participants = JSON.parse(giveaway.participants);
    const winners = [];

    for (let i = 0; i < giveaway.winners && participants.length > 0; i++) {
      const winnerIndex = Math.floor(Math.random() * participants.length);
      winners.push(`<@${participants[winnerIndex]}>`);
      participants.splice(winnerIndex, 1);
    }

    const embed = new EmbedBuilder()
      .setTitle('🎉 Sorteio Encerrado!')
      .setDescription(`🏆 **Vencedores:** ${winners.length > 0 ? winners.join(', ') : 'Nenhum participante'}\n🎁 **Prêmio:** ${giveaway.prize}`)
      .setColor('#FF0000');

    await message.edit({ embeds: [embed], components: [] });

    db.prepare('DELETE FROM giveaways WHERE message_id = ?').run(giveaway.message_id);
  }
}

module.exports = { finalizarSorteios };
