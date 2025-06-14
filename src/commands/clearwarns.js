const db = require('../data/database');
const { yellow } = require('../config/colors.json');
const { buildEmbed } = require('../utils/embedUtils');

module.exports = {
  name: 'clearwarns',
  description: 'Remove todos os avisos de um usuário.',
  usage: '${currentPrefix}clearwarns <@usuário>',
  userPermissions: ['ManageMessages'],
  botPermissions: ['ManageMessages'],

  async execute(message) {
    const user = message.mentions.members.first();
    if (!user) {
      return message.channel.send({
        embeds: [buildEmbed({
          color: yellow,
          author: { name: 'Você precisa mencionar um usuário.', 
          iconURL: message.author.displayAvatarURL() }
        })],
        allowedMentions: { repliedUser: false },
      });
    }

    db.prepare('DELETE FROM warnings WHERE user_id = ? AND guild_id = ?')
      .run(user.id, message.guild.id);

    return message.channel.send({
      embeds: [buildEmbed({
        color: yellow,
        title: 'Avisos Removidos',
        description: `Todos os avisos de ${user} foram removidos.`,
        footer: { text: message.author.tag, iconURL: message.author.displayAvatarURL() }
      })],
      allowedMentions: { repliedUser: false },
    });
  }
};
