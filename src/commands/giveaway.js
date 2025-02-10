const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../data/database');

module.exports = {
  name: 'giveaway',
  description: 'Gerencia sorteios no servidor.',
  usage: '${currentPrefix}giveaway start <tempo> <ganhadores> <prêmio>',
  permissions: 'Gerenciar Servidor',

  async execute(message, args) {
    if (!message.member.permissions.has('ManageGuild')) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({ name: 'Você não tem permissão para iniciar um sorteio!', iconURL: 'http://bit.ly/4aIyY9j' });

      return message.reply({ embeds: [embedErro] });
    }

    if (args[0] !== 'start') return;

    const timeInput = args[1];
    const winnerCount = parseInt(args[2]);
    const prize = args.slice(3).join(' ');

    if (!timeInput || !winnerCount || !prize) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({ name: 'Uso correto: .giveaway start <tempo> <ganhadores> <prêmio>', iconURL: 'http://bit.ly/4aIyY9j' });

      return message.reply({ embeds: [embedErro] });
    }

    const durationMs = convertTimeToMs(timeInput);
    if (!durationMs) {
      return message.reply({ content: 'Formato de tempo inválido! Use `1m`, `1h`, `1d`.' });
    }

    const endTime = Date.now() + durationMs;

    const embed = new EmbedBuilder()
      .setTitle('🎉 Novo Sorteio!')
      .setDescription(`🔹 **Prêmio:** ${prize}\n🎟 **Vencedores:** ${winnerCount}\n⏳ **Termina em:** <t:${Math.floor(endTime / 1000)}:R>`)
      .setColor('#00FF00')
      .setFooter({ text: 'Clique no botão para participar!' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('participar').setLabel('Participar 🎟').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('ver_participantes').setLabel('👥 Participantes: 0').setStyle(ButtonStyle.Secondary).setDisabled(true)
    );

    const giveawayMessage = await message.channel.send({ embeds: [embed], components: [row] });

    db.prepare(`
      INSERT INTO giveaways (guild_id, channel_id, message_id, prize, duration, winners, end_time, participants)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      message.guild.id,
      message.channel.id,
      giveawayMessage.id,
      prize,
      durationMs,
      winnerCount,
      endTime,
      JSON.stringify([])
    );

    message.delete().catch(() => null);
  },
};

function convertTimeToMs(time) {
  const regex = /^(\d+)([smhd])$/;
  const match = time.match(regex);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60000;
    case 'h': return value * 3600000;
    case 'd': return value * 86400000;
    default: return null;
  }
}
