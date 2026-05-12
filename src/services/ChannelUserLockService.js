"use strict";

const { PermissionsBitField } = require("discord.js");
const { sendModLog } = require("@modules/modlog");
const { createUserLockEmbed } = require("@embeds");

class ChannelUserLockService {
  static async lock({ guild, channel, moderator, target, reason }) {
    if (!guild || !channel || !target) {
      throw new Error("Guild, canal ou usuário inválido para bloqueio.");
    }

    if (!channel.permissionsFor(guild.members.me)
      ?.has(PermissionsBitField.Flags.ManageChannels)) {
      throw new Error("O bot não possui permissão para gerenciar canais.");
    }

    try {
      await channel.permissionOverwrites.edit(target, { SendMessages: false });

      const embed = createUserLockEmbed(moderator, target, reason);
      await channel.send({ embeds: [embed] });

      await sendModLog(guild, {
        action: "User Lock",
        target: target.user,
        moderator,
        reason,
        channel
      });

    } catch (error) {
      console.error(`[Service: ChannelUserLock] Erro ao bloquear usuário ${target.id} no canal ${channel.id}:`, error);
      throw error;
    }
  }
}

module.exports = ChannelUserLockService;
