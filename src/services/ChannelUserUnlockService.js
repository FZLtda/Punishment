"use strict";

const { PermissionsBitField } = require("discord.js");
const { sendModLog } = require("@modules/modlog");
const { createUserUnlockEmbed } = require("@embeds");

class ChannelUserUnlockService {
  /**
   * Desbloqueia um usuário específico no canal
   * @param {Object} options
   * @param {import('discord.js').Guild} options.guild
   * @param {import('discord.js').TextChannel} options.channel
   * @param {import('discord.js').User} options.moderator
   * @param {import('discord.js').GuildMember} options.target
   */
  static async unlock({ guild, channel, moderator, target }) {
    if (!guild || !channel || !target) {
      throw new Error("Guild, canal ou usuário inválido para desbloqueio.");
    }

    if (!channel.permissionsFor(guild.members.me)
      ?.has(PermissionsBitField.Flags.ManageChannels)) {
      throw new Error("O bot não possui permissão para gerenciar canais.");
    }

    try {
      await channel.permissionOverwrites.edit(target, { SendMessages: true });

      const embed = createUserUnlockEmbed(moderator, target);
      await channel.send({ embeds: [embed] });

      await sendModLog(guild, {
        action: "User Unlock",
        target: target.user,
        moderator,
        reason: `Usuário desbloqueado para enviar mensagens no canal ${channel}`,
        channel
      });

      console.info(`[Service: ChannelUserUnlock] Usuário ${target.id} desbloqueado no canal ${channel.id}.`);

    } catch (error) {
      console.error(`[Service: ChannelUserUnlock] Erro ao desbloquear usuário ${target.id} no canal ${channel.id}:`, error);
      throw error;
    }
  }
}

module.exports = ChannelUserUnlockService;

