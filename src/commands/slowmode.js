const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { logModerationAction } = require('../utils/moderationUtils');

module.exports = {
  name: 'slowmode',
  description: 'Configura o modo lento em um canal.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply('<:no:1122370713932795997> Você não tem permissão para usar este comando.');
    }

    const tempo = parseInt(args[0], 10);
    if (isNaN(tempo) || tempo < 0 || tempo > 21600) {
      return message.reply('<:no:1122370713932795997> Por favor, forneça um tempo válido (0-21600 segundos).');
    }

    try {
      await message.channel.setRateLimitPerUser(tempo);

      logModerationAction(
        message.guild.id,
        message.author.id,
        'Slowmode',
        message.channel.id,
        `Modo lento configurado para ${tempo} segundos`
      );

      const embed = new EmbedBuilder()
        .setTitle('<:emoji_50:1323312545532088330> Modo Lento Configurado')
        .setColor('Blue')
        .setDescription(`O modo lento foi configurado para \`${tempo}\` segundos neste canal.`)
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return message.reply('<:no:1122370713932795997> Ocorreu um erro ao tentar configurar o modo lento.');
    }
  },
};