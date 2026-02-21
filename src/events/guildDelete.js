'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis, channels } = require('@config');
const Logger = require('@logger');
const { sendBotData } = require('@jobs/sendBotData');

/**
 * Evento disparado quando o Punishment é removido de um servidor.
 */
module.exports = {
  name: 'guildDelete',

  async execute(guild, client) {
    try {
      Logger.warn(`[Guild Leave] Removido de: ${guild.name} (${guild.id})`);

      // Atualiza status na API
      await sendBotData(client);

      const logChannel = client.channels.cache.get(channels.log);
      if (!logChannel) {
        return Logger.warn('[Guild Leave] Canal de log não encontrado.');
      }

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.errorEmoji} Servidor removido`)
        .setColor(colors.red)
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .addFields(
          { name: 'Nome', value: guild.name || 'Desconhecido', inline: true },
          { name: 'ID', value: `\`${guild.id}\``, inline: true },
          { name: 'Membros', value: `\`${guild.memberCount ?? 'Desconhecido'}\``, inline: true }
        )
        .setFooter({ text: `${client.guilds.cache.size} servidores atuais` })
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });

    } catch (error) {
      Logger.error(
        '[Guild Leave] Erro ao processar saída do servidor:',
        error?.stack || error
      );
    }
  }
};
