'use strict';

const { EmbedBuilder } = require('discord.js');
const { performance } = require('node:perf_hooks');
const { sendWarning } = require('@embeds/embedWarning');
const { colors } = require('@config');

module.exports = {
  name: 'ping',
  description: 'Mostra a latência do bot e da API.',
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

      const embedColor = getPingColor(Math.max(pingBot, pingAPI));

      const embed = new EmbedBuilder()
        .setTitle('🏓 Pong!')
        .setColor(embedColor)
        .setDescription([
          `📡 **rest:** \`${pingBot}ms\``,
          `🌐 **gateway:** \`${pingAPI}ms\``
        ].join('\n'))
        .setFooter({
          text: message.author.tag,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      await sent.edit({ content: null, embeds: [embed] });

    } catch (error) {
      console.error('[Comando: ping] Erro ao executar:', error);
      if (message.channel?.send) {
        await sendWarning(message, 'Não foi possível calcular o ping.');
      }
    }
  }
};

function getPingColor(ping) {
  if (ping <= 100) return colors.green;
  if (ping <= 200) return colors.yellow;
  return colors.red;
}
