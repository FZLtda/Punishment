"use strict";

const { PermissionsBitField } = require("discord.js");
const { sendModLog } = require("@modules/modlog");
const ChannelLock = require("@models/ChannelLock");
const { createUnlockEmbed } = require("@embeds");

class ChannelLockService {
  /**
   * @param {Object} options
   * @param {import('discord.js').Guild} options.guild
   * @param {import('discord.js').TextChannel} options.channel
   * @param {import('discord.js').User} options.moderator
   * @param {string} options.reason
   */
  static async unlock({ guild, channel, moderator, reason }) {
    if (!guild || !channel) {
      throw new Error("Guild ou canal inválido para desbloqueio.");
    }

    const everyoneRole = guild.roles.everyone;

    if (!channel.permissionsFor(guild.members.me)
      ?.has(PermissionsBitField.Flags.ManageChannels)) {
      throw new Error("O bot não possui permissão para gerenciar canais.");
    }

    try {
      await channel.permissionOverwrites.edit(everyoneRole, { SendMessages: true });

      const embed = createUnlockEmbed(moderator, reason);

      const lockData = await ChannelLock.findOne({
        guildId: guild.id,
        channelId: channel.id,
      });

      if (lockData) {
        try {
          const lockMsg = await channel.messages.fetch(lockData.messageId);
          await lockMsg.edit({ embeds: [embed] });
        } catch {
          await channel.send({ embeds: [embed] });
        }

        await ChannelLock.deleteOne({
          guildId: guild.id,
          channelId: channel.id,
        });
      } else {
        await channel.send({ embeds: [embed] });
      }

      await sendModLog(guild, {
        action: "Unlock",
        moderator,
        reason,
        channel,
      });

    } catch (error) {
      console.error(`[Service: ChannelLock] Erro ao desbloquear canal ${channel.id}:`, error);
      throw error;
    }
  }
}

module.exports = ChannelUnLockService;

