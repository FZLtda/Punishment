const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { logModerationAction } = require('../moderationUtils');

module.exports = {
  name: 'unmute',
  description: 'Remove o mute (timeout) de um membro.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Você não possui permissão para usar este comando.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
    }

    const membro = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if (!membro) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Mencione um usuário para executar esta ação.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] }); 
    }

    if (!membro.communicationDisabledUntilTimestamp) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Não é possível remover o mute, pois o usuário não está silenciado.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
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
        .setTitle('<:ummute:1207381662741037147> Punição removida')
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
      return message.reply('<:no:1122370713932795997> Ocorreu um erro ao tentar remover o mute.');
    }
  },
};