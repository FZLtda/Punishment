'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'ping',
  description: 'Mostra a latência do bot e da API.',
  usage: '${currentPrefix}ping',
  category: 'Utilidade',
  botPermissions: ['SendMessages'],

  async execute(message, args, client) {
    const msg = await message.channel.send('Pong!');

    const pingBot = msg.createdTimestamp - message.createdTimestamp;
    const pingAPI = Math.round(client.ws.ping);

    const embed = new EmbedBuilder()
      .setColor(colors.red)
      .setDescription('🏓 Pong!\n\n'
        + `📶 **Latência:** \`${pingBot}ms\`\n`
        + `📶 **Latência da API:** \`${pingAPI}ms\``)
      .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    return msg.edit({ content: null, embeds: [embed] });
  }
};
