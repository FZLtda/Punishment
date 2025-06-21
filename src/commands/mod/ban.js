const { EmbedBuilder } = require('discord.js');
const { logModerationAction } = require('@utils/moderationUtils');
const { colors, emojis } = require('@config');


module.exports = {
  name: 'ban',
  description: 'Bane um membro do servidor.',
  usage: '${currentPrefix}ban <@usuário> [motivo]',
  userPermissions: ['BanMembers'],
  botPermissions: ['BanMembers'],
  deleteMessage: true,
    
  async execute(message, args) {

    const membro = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const motivo = args.slice(1).join(' ') || 'Não especificado.';

    if (!membro) {
      const embedErroMinimo = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Mencione um usuário para executar esta ação.',
          iconURL: emojis.icon_attention
        });

      return message.channel.send({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    if (!membro.bannable) {
      const embedErroMinimo = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Este usuário não pode ser banido devido às suas permissões.',
          iconURL: emojis.icon_attention
        });

      return message.chanel.send({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    try {
      await membro.ban({ reason: motivo });

      logModerationAction(message.guild.id, message.author.id, 'Ban', membro.id, motivo);

      const embed = new EmbedBuilder()
        .setTitle('<:Banido:1355700878056751244> Punição aplicada')
        .setColor(colors.red)
        .setDescription(`${membro} (\`${membro.id}\`) foi banido(a)!`)
        .addFields(
          { name: 'Motivo', value: `\`${motivo}\``, inline: false }
        )
        .setThumbnail(membro.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
    } catch (error) {
      console.error(error);
      const embedErroMinimo = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Não foi possível banir o usuário devido a um erro.',
          iconURL: emojis.icon_attention
        });

      return message.channel.send({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }
  },
};
