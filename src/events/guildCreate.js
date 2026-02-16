'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis, channels } = require('@config');
const Logger = require('@logger');
const { sendBotStatus } = require('@jobs/botStatusJob');

/**
 * Evento disparado quando o Punishment entra em um servidor.
 */
module.exports = {
  name: 'guildCreate',

  async execute(guild, client) {
    try {
      Logger.info(`[Guild Join] Entrou em: ${guild.name} (${guild.id})`);

      // Atualiza status na API
      await sendBotStatus(client);

      const logChannel = client.channels.cache.get(channels.log);
      if (!logChannel) {
        return Logger.warn('[Guild Join] Canal de log não encontrado.');
      }

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.successEmoji} Servidor adicionado`)
        .setColor(colors.green)
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .addFields(
          { name: 'Nome', value: guild.name, inline: true },
          { name: 'ID', value: `\`${guild.id}\``, inline: true },
          { name: 'Membros', value: `\`${guild.memberCount ?? 'Desconhecido'}\``, inline: true },
          { name: 'Dono', value: `<@${guild.ownerId}> (\`${guild.ownerId}\`)`, inline: false }
        )
        .setFooter({ text: `${client.guilds.cache.size} servidores atuais` })
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });

    } catch (error) {
      Logger.error('[Guild Join] Erro ao processar entrada no servidor:', error);
    }
  }
};
