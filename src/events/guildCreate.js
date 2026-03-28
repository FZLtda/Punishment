"use strict";

const { EmbedBuilder, Events } = require("discord.js");
const { colors, emojis, channels } = require("@config");
const Logger = require("@logger");
const { sendBotData } = require("@jobs/sendBotData");

module.exports = {
  name: Events.GuildCreate,

  /**
   * Evento executado quando o bot entra em um servidor.
   * Registra a entrada, notifica no canal de logs e atualiza os dados da API.
   * @param {import('discord.js').Guild} guild
   * @param {import('discord.js').Client} client
   */
  async execute(guild, client) {
    try {
      Logger.info(`[Guild Join] Entrou em: ${guild.name} (${guild.id})`);

      await sendBotData(client).catch((err) => 
        Logger.error("[Guild Join] Falha não-fatal ao atualizar API:", err)
      );

      const logChannel = client.channels.cache.get(channels.log) 
        ?? await client.channels.fetch(channels.log).catch(() => null);

      if (!logChannel || !logChannel.isTextBased()) {
        return Logger.warn("[Guild Join] Canal de log não encontrado ou inválido.");
      }

      let resolvedOwnerName = "Dono desconhecido";
      const owner = await guild.fetchOwner().catch(() => null);

      if (owner?.user) {
        resolvedOwnerName = owner.user.displayName ?? owner.user.username ?? "Dono desconhecido";
      }

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.successEmoji} Servidor adicionado`)
        .setColor(colors.green)
        .setThumbnail(guild.iconURL({ dynamic: true }) ?? null)
        .addFields(
          { name: "Nome", value: guild.name, inline: true },
          { name: "ID", value: `\`${guild.id}\``, inline: true },
          { name: "Membros", value: `\`${guild.memberCount ?? "Desconhecido"}\``, inline: true },
          { name: "Dono", value: `**${resolvedOwnerName}** (\`${guild.ownerId}\`)`, inline: false }
        )
        .setFooter({ text: `${client.guilds.cache.size} servidores atuais` })
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });

    } catch (error) {
      Logger.error(`[Guild Join] Erro crítico ao processar entrada no servidor (${guild?.id}):`, error);
    }
  }
};
