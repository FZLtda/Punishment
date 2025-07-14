'use strict';

const { EmbedBuilder } = require('discord.js');
const { performance } = require('node:perf_hooks');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'ping',
  description: 'Mostra a latência do bot, da API e o tempo de atividade.',
  usage: '${currentPrefix}ping',
  category: 'Utilidade',
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message) {
    const start = performance.now();
    const sent = await message.channel.send('🏓 Carregando ping...');
    const end = performance.now();

    const pingBot = Math.round(end - start);
    const pingAPI = Math.round(message.client.ws.ping);
    const uptime = formatUptime(process.uptime());

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.ping} Ping do Bot`)
      .setColor(colors.green)
      .setDescription([
        `📡 **Latência do Bot:** \`${pingBot}ms\``,
        `🌐 **Latência da API:** \`${pingAPI}ms\``,
        `⏱️ **Uptime:** \`${uptime}\``
      ].join('\n'))
      .setFooter({
        text: message.client.user.username,
        iconURL: message.client.user.displayAvatarURL()
      })
      .setTimestamp();

    await sent.edit({ content: null, embeds: [embed] });
  }
};

/**
 * Formata o uptime do bot para uma string legível.
 * @param {number} seconds 
 * @returns {string}
 */
function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}
