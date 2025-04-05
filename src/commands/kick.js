const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { logModerationAction } = require('../utils/moderationUtils');

module.exports = {
  name: 'kick',
  description: 'Expulsa um membro do servidor.',
  usage: '${currentPrefix}kick <@usuário> [motivo]',
  userPermissions: ['KickMembers'],
  botPermissions: ['KickMembers'],
  deleteMessage: true,
  
  async execute(message, args) {

    const membro = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const motivo = args.slice(1).join(' ') || 'Não especificado.';

    if (!membro) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Mencione um usuário para executar esta ação.',
          iconURL: 'https://bit.ly/43PItSI'
      });

  return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    if (!membro.kickable) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Este usuário não pode ser expulso devido às suas permissões.',
          iconURL: 'https://bit.ly/43PItSI'
      });

  return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    try {
      await membro.kick(motivo);

      logModerationAction(message.guild.id, message.author.id, 'Kick', membro.id, motivo);

      const kickEmbed = new EmbedBuilder()
        .setTitle('<:Expulso:1355700922197606573> Punição aplicada')
        .setColor('Red')
        .setDescription(`${membro} (\`${membro.id}\`) foi expulso(a) do servidor!`)
        .addFields(
          { name: 'Motivo', value: `\`${motivo}\``, inline: false }
        )
        .setThumbnail(membro.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await message.channel.send({ embeds: [kickEmbed] });
    } catch (error) {
      console.error(error);
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Não foi possível expulsar o usuário devido a um erro.',
          iconURL: 'https://bit.ly/43PItSI'
      });

  return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }
  },
};
