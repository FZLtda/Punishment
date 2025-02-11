const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { logModerationAction } = require('../utils/moderationUtils');

module.exports = {
  name: 'slowmode',
  description: 'Configura o modo lento em um canal.',
  usage: '${currentPrefix}slowmode <tempo>',
  permissions: 'Gerenciar Canais',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Você não possui permissão para usar este comando.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    const tempo = parseInt(args[0], 10);
    if (isNaN(tempo) || tempo < 0 || tempo > 21600) {
      const embedErroMinimo = new EmbedBuilder()
            .setColor('#FF4C4C')
            .setAuthor({
                name: 'Por favor, forneça um tempo válido (0-21600 segundos).',
                iconURL: 'http://bit.ly/4aIyY9j'
            });
      
        return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
      
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
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Não foi possível configurar o modo lento devido a um erro.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }
  },
};
