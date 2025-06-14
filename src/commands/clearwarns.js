const db = require('../data/database');
const { yellow, red } = require('../config/colors.json');
const { icon_attention, attent } = require('../config/emoji.json');
const { buildEmbed } = require('../utils/embedUtils');
const { logModerationAction } = require('../utils/moderationUtils');

module.exports = {
  name: 'clearwarns',
  description: 'Remove todos os avisos de um usuário.',
  usage: '${currentPrefix}clearwarns <@usuário>',
  userPermissions: ['ManageMessages'],
  botPermissions: ['ManageMessages'],
  deleteMessage: true,

  async execute(message) {
    if (this.deleteMessage) {
      message.delete().catch(() => {});
    }

    const user = message.mentions.members.first();

    if (!user) {
      const embed = buildEmbed({
        color: yellow,
        author: {
          name: 'Você precisa mencionar um usuário.',
          iconURL: icon_attention,
        },
      });
      return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }

    const { count: totalWarnings } = db
      .prepare('SELECT COUNT(*) AS count FROM warnings WHERE user_id = ? AND guild_id = ?')
      .get(user.id, message.guild.id);

    if (totalWarnings === 0) {
      const embed = buildEmbed({
        color: yellow,
        author: {
          name: 'Este usuário não possui avisos para remover.',
          iconURL: icon_attention,
        },
      });
      return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }

    try {
      db.prepare('DELETE FROM warnings WHERE user_id = ? AND guild_id = ?')
        .run(user.id, message.guild.id);

      logModerationAction(message.guild.id, message.author.id, 'ClearWarns', user.id, `Removeu ${totalWarnings} aviso(s)`);

      const embed = buildEmbed({
        color: red,
        title: `${attent} Avisos Removidos`,
        description: `Todos os **${totalWarnings}** aviso(s) de ${user} (\`${user.id}\`) foram removidos com sucesso.`,
        thumbnail: user.user.displayAvatarURL({ dynamic: true }),
        footer: {
          text: message.author.tag,
          iconURL: message.author.displayAvatarURL(),
        },
        timestamp: true,
      });

      return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
    } catch (error) {
      console.error('Erro ao remover avisos:', error);

      const embed = buildEmbed({
        color: yellow,
        author: {
          name: 'Não foi possível remover os avisos devido a um erro interno.',
          iconURL: icon_attention,
        },
      });

      return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
  },
};
