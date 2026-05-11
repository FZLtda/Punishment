"use strict";

const { PermissionsBitField } = require("discord.js");
const { sendModLog } = require("@modules/modlog");
const ChannelLock = require("@models/ChannelLock");
const { createLockEmbed } = require("@embeds");

class ChannelLockService {
  /**
   * @param {Object} options
   * @param {import('discord.js').Guild} options.guild
   * @param {import('discord.js').TextChannel} options.channel
   * @param {import('discord.js').User} options.moderator
   * @param {string} options.reason
   */
  static async lock({ guild, channel, moderator, reason }) {
    if (!guild || !channel) {
      throw new Error("Guild ou canal inválido para bloqueio.");
    }

    const everyoneRole = guild.roles.everyone;

    if (!channel.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.ManageChannels)) {
      throw new Error("O bot não possui permissão para gerenciar canais.");
    }

    try {
      await channel.permissionOverwrites.edit(everyoneRole, { SendMessages: false });

      const embed = createLockEmbed(moderator, reason);
      const msg = await channel.send({ embeds: [embed] });

      await ChannelLock.findOneAndUpdate(
        { guildId: guild.id, channelId: channel.id },
        { guildId: guild.id, channelId: channel.id, messageId: msg.id },
        { upsert: true }
      );

      await sendModLog(guild, {
        action: "Lock",
        moderator,
        reason,
        channel
      });

    } catch (error) {
      console.error(`[Service: ChannelLock] Erro ao bloquear canal ${channel.id}:`, error);
      throw error;
    }
  }
}

module.exports = ChannelLockService;
    
