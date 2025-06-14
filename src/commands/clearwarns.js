const { EmbedBuilder } = require('discord.js');
const db = require('../data/database');
const { yellow } = require('../config/colors.json');
const { icon_attention, attent } = require('../config/emoji.json');
const { logModerationAction } = require('../utils/moderationUtils');

module.exports = {
  name: 'clearwarns',
  description: 'Remove todos os avisos de um usuário.',
  usage: '${currentPrefix}clearwarns <@usuário>',
  userPermissions: ['ManageMessages'],
  botPermissions: ['ManageMessages'],
  deleteMessage: true,

  async execute(message) {
    if (this.deleteMessage) message.delete().catch(() => {});

    const user = message.mentions.members.first();

    if (!user) {
      const embed = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Você precisa mencionar um usuário.',
          iconURL: icon_attention,
        });

      return message.channel.send({
        embeds: [embed],
        allowedMentions: { repliedUser: false },
      });
    }

    const { count: totalWarnings } = db
      .prepare('SELECT COUNT(*) AS count FROM warnings WHERE user_id = ? AND guild_id = ?')
      .get(user.id, message.guild.id);

    if (totalWarnings === 0) {
      const embed = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Este usuário não possui avisos para remover.',
          iconURL: icon_attention,
        });

      return message.channel.send({
        embeds: [embed],
        allowedMentions: { repliedUser: false },
      });
    }

    try {
      db.prepare('DELETE FROM warnings WHERE user_id = ? AND guild_id = ?')
        .run(user.id, message.guild.id);

      logModerationAction(
        message.guild.id,
        message.author.id,
        'ClearWarns',
        user.id,
        `Removeu ${totalWarnings} aviso(s)`
      );

      const embed = new EmbedBuilder()
        .setColor(yellow)
        .setTitle(`${attent} Avisos Removidos`)
        .setDescription(`${user} (\`${user.id}\`) teve \`${totalWarnings}\` aviso(s) removido(s).`)
        .setThumbnail(user.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: message.author.tag,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({
        embeds: [embed],
        allowedMentions: { repliedUser: false },
      });

    } catch (error) {
      console.error('Erro ao remover avisos:', error);

      const embed = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Não foi possível remover os avisos devido a um erro interno.',
          iconURL: icon_attention,
        });

      return message.channel.send({
        embeds: [embed],
        allowedMentions: { repliedUser: false },
      });
    }
  },
};
