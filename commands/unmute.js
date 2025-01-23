const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'unmute',
  description: 'Remove o mute (timeout) de um membro.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply('<:no:1122370713932795997> Você não tem permissão para usar este comando.');
    }

    const membro = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if (!membro) {
      return message.reply('<:no:1122370713932795997> Você precisa mencionar um membro ou fornecer o ID.');
    }

    if (!membro.communicationDisabledUntilTimestamp) {
      return message.reply('<:no:1122370713932795997> Este membro não está mutado.');
    }

    try {
      await membro.timeout(null);

      const embed = new EmbedBuilder()
        .setTitle('<:ummute:1207381662741037147> Punição removida')
        .setColor('Green')
        .setDescription(`${membro} (\`${membro.id}\`) foi desmutado(a)!`)
        .setThumbnail(membro.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `${message.author.displayName}`,
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