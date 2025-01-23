const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

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
      return message.reply(
        `**<:emoji_50:1323312545532088330> O modo lento foi configurado para \`${tempo}\` segundos neste canal**.`
      );
    } catch (error) {
      console.error(error);
      return message.reply('<:no:1122370713932795997> Ocorreu um erro ao tentar configurar o modo lento.');
    }
  },
};