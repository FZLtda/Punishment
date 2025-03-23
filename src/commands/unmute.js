const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { logModerationAction } = require('../utils/moderationUtils');

module.exports = {
  name: 'unmute',
  description: 'Remove o mute (timeout) de um membro.',
  usage: '${currentPrefix}unmute <@usuário> [motivo]',
  permissions: 'Moderar Membros',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Você não possui permissão para usar este comando.',
          iconURL: 'https://bit.ly/43PItSI'
      });

  return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    const membro = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if (!membro) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Mencione um usuário para executar esta ação.',
          iconURL: 'https://bit.ly/43PItSI'
      });

  return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } }); 
    }

    if (!membro.communicationDisabledUntilTimestamp) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Não é possível remover o mute, pois o usuário não está silenciado.',
          iconURL: 'https://bit.ly/43PItSI'
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
        .setTitle('<:1000046496:1340401276990787604> Punição removida')
        .setColor('Green')
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
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Não foi possível remover o mute do usuário devido a um erro.',
          iconURL: 'https://bit.ly/43PItSI'
      });

  return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }
  },
};
