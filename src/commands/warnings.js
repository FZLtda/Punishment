const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const db = require('../data/database');

module.exports = {
  name: 'warnings',
  description: 'Exibe os avisos acumulados de um usuário.',
  usage: '[prefixo]warnings <@usuário>',
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
          name: 'Você precisa mencionar um usuário para visualizar os avisos.',
          iconURL: 'http://bit.ly/4aIyY9j',
        });

      return message.reply({ embeds: [embedErro] });
    }

    const warnings = db.prepare('SELECT * FROM warnings WHERE guild_id = ? AND user_id = ?')
      .all(message.guild.id, user.id);

    if (warnings.length === 0) {
      const embedSemAvisos = new EmbedBuilder()
        .setColor('#00b894')
        .setAuthor({
          name: `${user.user.tag} não possui avisos.`,
          iconURL: user.user.displayAvatarURL({ dynamic: true }),
        });

      return message.reply({ embeds: [embedSemAvisos] });
    }

    const embedWarnings = new EmbedBuilder()
      .setColor('#f5a623')
      .setAuthor({
        name: `Avisos de ${user.user.tag}`,
        iconURL: user.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        warnings
          .map((warn, index) => `**${index + 1}.** Aplicado por <@${warn.moderator_id}> - ${warn.reason} \n📅 <t:${Math.floor(warn.timestamp / 1000)}:F>`)
          .join('\n\n')
      )
      .setFooter({
        text: `Total de avisos: ${warnings.length}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      });

    return message.reply({ embeds: [embedWarnings] });
  },
};
