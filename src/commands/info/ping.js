'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'ping',
  description: 'Mostra a latência do bot e da API.',
  usage: '${currentPrefix}ping',
  category: 'Utilidade',
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message, args) {
    const msg = await message.channel.send('Pong!');

    const pingBot = msg.createdTimestamp - message.createdTimestamp;
    const pingAPI = Math.round(message.client.ws.ping);

    const embed = new EmbedBuilder()
      .setColor(colors.red)
      .setDescription('🏓 Pong!\n\n'
        + `${emojis.ping} **Latência:** \`${pingBot}ms\`\n`
        + `${emojis.ping} **Latência da API:** \`${pingAPI}ms\``)
      .setFooter({ text: message.client.user.username, iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();

    return msg.edit({ content: null, embeds: [embed] });
  }
};
