const { EmbedBuilder } = require('discord.js');
const { logModerationAction } = require('../utils/moderationUtils');
const { yellow, green } = require('../config/colors.json');
const { icon_attention } = require('../config/emoji.json');

module.exports = {
  name: 'unmute',
  description: 'Remove o mute (timeout) de um membro.',
  usage: '${currentPrefix}unmute <@usuário> [motivo]',
  userPermissions: ['ModerateMembers'],
  botPermissions: ['ModerateMembers'],
  deleteMessage: true,
  
  async execute(message, args) {

    const membro = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if (!membro) {
      const embedErroMinimo = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Mencione um usuário para executar esta ação.',
          iconURL: icon_attention
        });

      return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } }); 
    }

    if (!membro.communicationDisabledUntilTimestamp) {
      const embedErroMinimo = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Não é possível remover o mute, pois o usuário não está silenciado.',
          iconURL: icon_attention
        });

      return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    try {
      await membro.timeout(null);

      logModerationAction(
        message.guild.id,
        message.author.id,
        'Unmute',
        membro.id,
        'Timeout removido'
      );

      const embed = new EmbedBuilder()
        .setTitle('<:Desmutado:1355700639681740880> Punição removida')
        .setColor(green)
        .setDescription(`${membro} (\`${membro.id}\`) foi desmutado(a)!`)
        .setThumbnail(membro.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const embedErroMinimo = new EmbedBuilder()
      
        .setColor(yellow)
        .setAuthor({
          name: 'Não foi possível remover o mute do usuário devido a um erro.',
          iconURL: icon_attention,
        });

      return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }
  },
};
