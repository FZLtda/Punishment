"use strict";

const { EmbedBuilder, Events } = require("discord.js");
const { colors, emojis, channels } = require("@config");
const Logger = require("@logger");
const { sendBotData } = require("@jobs/sendBotData");

module.exports = {
  name: Events.GuildDelete,

  /**
   * Evento executado quando o bot é removido de um servidor.
   * Registra a saída, notifica no canal de logs e atualiza os dados da API.
   * @param {import('discord.js').Guild} guild
   * @param {import('discord.js').Client} client
   */
  async execute(guild, client) {
    try {
      Logger.warn(`[Guild Leave] Removido de: ${guild.name} (${guild.id})`);

      await sendBotData(client).catch((err) => 
        Logger.error("[Guild Leave] Falha não-fatal ao atualizar API:", err)
      );

      const logChannel = client.channels.cache.get(channels.log) 
        ?? await client.channels.fetch(channels.log).catch(() => null);

      if (!logChannel || !logChannel.isTextBased()) {
        return Logger.warn("[Guild Leave] Canal de log não encontrado ou inválido.");
      }

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.errorEmoji} Servidor removido`)
        .setColor(colors.red)
        .setThumbnail(guild.iconURL({ dynamic: true }) ?? null)
        .addFields(
          { name: "Nome", value: guild.name ?? "Desconhecido", inline: true },
          { name: "ID", value: `\`${guild.id}\``, inline: true },
          { name: "Membros", value: `\`${guild.memberCount ?? "Desconhecido"}\``, inline: true }
        )
        .setFooter({ text: `${client.guilds.cache.size} servidores atuais` })
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });

    } catch (error) {
      Logger.error(`[Guild Leave] Erro crítico ao processar saída do servidor (${guild?.id}):`, error);
    }
  }
};
