const { EmbedBuilder } = require('discord.js');
const { red, green } = require('../../config/colors.json');
const { icon_shutdown } = require('../../config/emoji.json');
const logger = require('../../utils/logger');

module.exports = {
  name: 'restart',
  description: 'Reinicia o bot com segurança.',
  category: 'Administração',
  aliases: ['reboot', 'shutdown'],
  cooldown: 5,
  async execute(message, args, client) {
    const ownerIds = process.env.OWNERS_ID?.split(',') || [];
    if (!ownerIds.includes(message.author.id)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(red)
            .setDescription(`${icon_shutdown} | Você não tem permissão para reiniciar o bot.`)
        ]
      });
    }

    const embed = new EmbedBuilder()
      .setColor(green)
      .setTitle(`${icon_shutdown} Reiniciando...`)
      .setDescription('O bot está sendo reiniciado com segurança. Aguarde alguns segundos.')
      .setFooter({ text: 'Shutdown iniciado por ' + message.author.tag });

    await message.channel.send({ embeds: [embed] });

    logger.warn(`Reinício solicitado por ${message.author.tag} (${message.author.id})`);
    
    setTimeout(() => {
      process.exit(0);
    }, 3000);
  }
};
