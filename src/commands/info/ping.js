'use strict';

const { EmbedBuilder } = require('discord.js');
const { performance } = require('node:perf_hooks');
const { colors } = require('@config');

module.exports = {
  name: 'ping',
  description: 'Mostra a latência do bot, da API e o tempo de atividade.',
  usage: '${currentPrefix}ping',
  category: 'Utilidade',
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message) {
    const start = performance.now();
    const sent = await message.channel.send('🏓 Calculando ping...');
    const end = performance.now();

    const pingBot = Math.round(end - start);
    const pingAPI = Math.round(message.client.ws.ping);
    const uptime = formatUptime(process.uptime());

    const embedColor = getPingColor(Math.max(pingBot, pingAPI));

    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .setColor(embedColor)
      .setDescription([
        `📡 **Latência do Bot:** \`${pingBot}ms\``,
        `🌐 **Latência da API:** \`${pingAPI}ms\``,
        `⏱️ **Uptime:** \`${uptime}\``
      ].join('\n'))
      .setFooter({
        text: `${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    await sent.edit({ content: null, embeds: [embed] });
  }
};

/**
 * Formata o uptime do bot para meses, dias, horas, minutos e segundos.
 * @param {number} seconds - Uptime em segundos.
 * @returns {string}
 */

function formatUptime(seconds) {
  const months = Math.floor(seconds / 2592000);
  seconds %= 2592000;

  const days = Math.floor(seconds / 86400);
  seconds %= 86400;

  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (months) parts.push(`${months}mês${months > 1 ? 'es' : ''}`);
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (secs) parts.push(`${secs}s`);

  return parts.join(' ') || '0s';
}

/**
 * Define cor do embed com base na latência.
 * @param {number} ping - Latência em ms.
 * @returns {string}
 */

function getPingColor(ping) {
  if (ping <= 100) return colors.green;
  if (ping <= 200) return colors.yellow;
  return colors.red;
}
