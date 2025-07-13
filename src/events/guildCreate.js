'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis, channels } = require('@config');
const Logger = require('@logger');

/**
 * Evento disparado quando o bot entra em um servidor.
 */
module.exports = {
  name: 'guildCreate',

  async execute(guild, client) {
    Logger.info(`[Guild Join] Entrou em: ${guild.name} (${guild.id})`);

    const logChannel = client.channels.cache.get(channels.log);
    if (!logChannel) return Logger.warn('[Guild Join] Canal de log não encontrado.');

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.successEmoji} Servidor adicionado`)
      .setColor(colors.green)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: 'Nome', value: guild.name, inline: true },
        { name: 'ID', value: `\`${guild.id}\``, inline: true },
        { name: 'Membros', value: `\`${guild.memberCount}\``, inline: true },
        { name: 'Dono', value: `<@${guild.ownerId}> (\`${guild.ownerId}\`)`, inline: false }
      )
      .setFooter({ text: `${client.guilds.cache.size} servidores` })
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
  }
};
