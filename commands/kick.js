const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { logModerationAction } = require('../moderationUtils');

module.exports = {
  name: 'kick',
  description: 'Expulsa um membro do servidor.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.reply('<:no:1122370713932795997> Você não tem permissão para usar este comando.');
    }

    const membro = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const motivo = args.slice(1).join(' ') || 'Não especificado.';

    if (!membro) {
      return message.reply('<:no:1122370713932795997> Você precisa mencionar um membro ou fornecer o ID.');
    }

    if (!membro.kickable) {
      return message.reply('<:no:1122370713932795997> Não é possível expulsar este membro.');
    }

    try {
      await membro.kick(motivo);

      logModerationAction(message.guild.id, message.author.id, 'Kick', membro.id, motivo);

      const kickEmbed = new EmbedBuilder()
        .setTitle('<:emoji_23:1216481209153224745> Membro Expulso')
        .setColor('Red')
        .setDescription(`${membro} (\`${membro.id}\`) foi expulso(a) do servidor!`)
        .addFields(
          { name: 'Motivo', value: motivo, inline: false }
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
      message.reply('<:no:1122370713932795997> Ocorreu um erro ao tentar expulsar o membro.');
    }
  },
};