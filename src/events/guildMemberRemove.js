"use strict";

const { EmbedBuilder, Events } = require("discord.js");
const { colors, emojis, channels, bot } = require("@config");
const Logger = require("@logger");

module.exports = {
  name: Events.GuildMemberRemove, 
  description: "Notifica quando um membro sai do servidor específico.",
  once: false,

  /**
   * Executa quando um membro sai do servidor.
   * @param {import('discord.js').GuildMember | import('discord.js').PartialGuildMember} member
   * @param {import('discord.js').Client} client
   */
  async execute(member, client) {
    try {
      if (member.guild.id !== bot.serverId) return;

      
      const userId = member.id;
      const user = member.user;

      
      const resolvedDisplayName = user?.displayName 
        ?? user?.username 
        ?? "Usuário desconhecido";
        
      
      const resolvedAvatarURL = user?.displayAvatarURL?.({ dynamic: true }) ?? null;

      
      const logChannel = client.channels.cache.get(channels.log) 
        ?? await client.channels.fetch(channels.log).catch(() => null);

      if (!logChannel || !logChannel.isTextBased()) {
        return Logger.warn(
          `[guildMemberRemove] Canal de logs (${channels.log}) não encontrado ou inválido no servidor ${member.guild.id}.`
        );
      }

      
      const embed = new EmbedBuilder()
        .setTitle(`${emojis.kick} Membro saiu`)
        .setColor(colors.red)
        .setDescription(`**${resolvedDisplayName}** (\`${userId}\`) saiu do servidor.`)
        .setThumbnail(resolvedAvatarURL)
        .setFooter({
          text: member.guild.name,
          iconURL: member.guild.iconURL?.({ dynamic: true }) ?? undefined
        })
        .setTimestamp();

      
      await logChannel.send({ embeds: [embed] });

      Logger.info(
        `[guildMemberRemove] Membro ${resolvedDisplayName} (${userId}) saiu do servidor ${member.guild.id}.`
      );
    } catch (error) {
      Logger.error(`[guildMemberRemove] Erro crítico ao processar saída do membro (ID: ${member?.id}):`, error);
    }
  }
};
