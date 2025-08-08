'use strict';

const { EmbedBuilder } = require('discord.js');
const { performance } = require('node:perf_hooks');
const { sendWarning } = require('@embeds/embedWarning');
const { colors } = require('@config');

module.exports = {
  name: 'ping',
  description: 'Mostra a latência do bot, da API e o tempo de atividade.',
  usage: '${currentPrefix}ping',
  category: 'Utilidade',
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message) {
    try {
      const start = performance.now();
      const sent = await message.channel.send('🏓 Calculando ping...');
      const end = performance.now();

      const pingBot = isFinite(end - start) ? Math.round(end - start) : 0;
      const pingAPI = isFinite(message.client.ws.ping) ? Math.round(message.client.ws.ping) : 0;
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
          text: message.author.tag,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      await sent.edit({ content: null, embeds: [embed] });

    } catch (error) {
      console.error(`[Comando: ping] Erro ao executar:`, error);
      if (message.channel?.send) {
        await sendWarning(message, 'Não foi possível calcular o ping.');
      }
    }
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
  if (months) parts.push(`${months} ${pluralize(months, 'mês', 'meses')}`);
  if (days) parts.push(`${days} ${pluralize(days, 'dia', 'dias')}`);
  if (hours) parts.push(`${hours} ${pluralize(hours, 'hora', 'horas')}`);
  if (minutes) parts.push(`${minutes} ${pluralize(minutes, 'minuto', 'minutos')}`);
  if (secs) parts.push(`${secs} ${pluralize(secs, 'segundo', 'segundos')}`);

  return parts.join(' ') || '0 segundos';
}

/**
 * Pluraliza uma palavra com base na quantidade.
 * @param {number} count - Quantidade.
 * @param {string} singular - Forma singular.
 * @param {string} plural - Forma plural.
 * @returns {string}
 */
function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural;
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
