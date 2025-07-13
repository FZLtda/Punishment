'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis, channels } = require('@config');
const Logger = require('@logger');

/**
 * Evento disparado quando o bot é removido de um servidor.
 */
module.exports = {
  name: 'guildDelete',

  async execute(guild, client) {
    Logger.warn(`[Guild Leave] Removido de: ${guild.name} (${guild.id})`);

    const logChannel = client.channels.cache.get(channels.log);
    if (!logChannel) return Logger.warn('[Guild Leave] Canal de log não encontrado.');

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.errorEmoji} Servidor removido`)
      .setColor(colors.red)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: 'Nome', value: guild.name, inline: true },
        { name: 'ID', value: `\`${guild.id}\``, inline: true },
        { name: 'Membros', value: `\`${guild.memberCount}\``, inline: true }
      )
      .setFooter({ text: `${client.guilds.cache.size} servidores` })
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
  }
};
