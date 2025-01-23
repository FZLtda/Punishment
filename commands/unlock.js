const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'unlock',
  description: 'Desbloqueia o envio de mensagens em um canal.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply('<:no:1122370713932795997> Você não tem permissão para usar este comando.');
    }

    const channel = message.mentions.channels.first() || message.channel;

    try {
      await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: true,
      });

      const embed = new EmbedBuilder()
        .setTitle('<:emoji_49:1322515171578744915> Canal Desbloqueado')
        .setDescription(`O canal ${channel} foi desbloqueado para envio de mensagens.`)
        .setColor('Green')
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('<:no:1122370713932795997> Ocorreu um erro ao desbloquear o canal.');
    }
  },
};