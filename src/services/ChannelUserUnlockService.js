"use strict";

const { PermissionsBitField } = require("discord.js");
const { sendModLog } = require("@modules/modlog");
const { createUserUnlockEmbed } = require("@embeds");

class ChannelUserUnlockService {
  static async unlock({ guild, channel, moderator, target, reason }) {
    if (!guild || !channel || !target) {
      throw new Error("Guild, canal ou usuário inválido para desbloqueio.");
    }

    if (!channel.permissionsFor(guild.members.me)
      ?.has(PermissionsBitField.Flags.ManageChannels)) {
      throw new Error("O bot não possui permissão para gerenciar canais.");
    }

    try {
      await channel.permissionOverwrites.edit(target, { SendMessages: true });

      const embed = createUserUnlockEmbed(moderator, target, reason);
      await channel.send({ embeds: [embed] });

      await sendModLog(guild, {
        action: "User Unlock",
        target: target.user,
        moderator,
        reason,
        channel
      });

    } catch (error) {
      console.error(`[Service: ChannelUserUnlock] Erro ao desbloquear usuário ${target.id} no canal ${channel.id}:`, error);
      throw error;
    }
  }
}

module.exports = ChannelUserUnlockService;

