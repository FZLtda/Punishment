const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const db = require('../data/database');

module.exports = {
  name: 'warn',
  description: 'Adiciona um aviso a um usuário no servidor.',
  usage: '${currentPrefix}warn <@usuário> [motivo]',
  permissions: 'Gerenciar Mensagens',
  async execute(message, args) {
  
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Você não tem permissão para usar este comando.',
          iconURL: 'https://bit.ly/43PItSI',
        });
      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    const user = message.mentions.members.first();
    if (!user) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Mencione um usuário para aplicar o aviso.',
          iconURL: 'https://bit.ly/43PItSI',
        });
      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    const reason = args.slice(1).join(' ') || 'Nenhum motivo especificado';

    db.prepare(`
      INSERT INTO warnings (user_id, guild_id, reason, moderator_id, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run(user.id, message.guild.id, reason, message.author.id, Date.now());

    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('Usuário Avisado')
      .setDescription(
        `**Usuário:** ${user}\n` +
        `**Motivo:** ${reason}\n` +
        `**Moderador:** ${message.author}`
      )
      .setFooter({
        text: message.author.username,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

      message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
  },
};
