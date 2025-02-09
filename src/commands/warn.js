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
          iconURL: 'http://bit.ly/4aIyY9j',
        });

      return message.reply({ embeds: [embedErro] });
    }

    const user = message.mentions.members.first();
    if (!user) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Você precisa mencionar um usuário para aplicar o aviso.',
          iconURL: 'http://bit.ly/4aIyY9j',
        });

      return message.reply({ embeds: [embedErro] });
    }

    if (user.id === message.author.id) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Você não pode avisar a si mesmo.',
          iconURL: 'http://bit.ly/4aIyY9j',
        });

      return message.reply({ embeds: [embedErro] });
    }

    const reason = args.slice(1).join(' ') || 'Sem motivo especificado';

    db.prepare('INSERT INTO warnings (guild_id, user_id, moderator_id, reason, timestamp) VALUES (?, ?, ?, ?, ?)')
      .run(message.guild.id, user.id, message.author.id, reason, Date.now());

    const embedSucesso = new EmbedBuilder()
      .setColor('#f5a623')
      .setAuthor({
        name: `Aviso aplicado a ${user.user.tag}`,
        iconURL: user.user.displayAvatarURL({ dynamic: true }),
      })
      .addFields(
        { name: '👤 Usuário', value: `<@${user.id}>`, inline: true },
        { name: '📌 Motivo', value: reason, inline: true },
        { name: '👮 Aplicado por', value: `<@${message.author.id}>`, inline: true }
      )
      .setTimestamp()
      .setFooter({
        text: `${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      });

    return message.reply({ embeds: [embedSucesso] });
  },
};
