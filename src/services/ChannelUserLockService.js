"use strict";

const { PermissionsBitField } = require("discord.js");
const { sendModLog } = require("@modules/modlog");
const { createUserLockEmbed } = require("@embeds");

class ChannelUserLockService {
  /**
   * Bloqueia um usuário específico no canal
   * @param {Object} options
   * @param {import('discord.js').Guild} options.guild
   * @param {import('discord.js').TextChannel} options.channel
   * @param {import('discord.js').User} options.moderator
   * @param {import('discord.js').GuildMember} options.target
   */
  static async lock({ guild, channel, moderator, target }) {
    if (!guild || !channel || !target) {
      throw new Error("Guild, canal ou usuário inválido para bloqueio.");
    }

    if (!channel.permissionsFor(guild.members.me)
      ?.has(PermissionsBitField.Flags.ManageChannels)) {
      throw new Error("O bot não possui permissão para gerenciar canais.");
    }

    try {
      await channel.permissionOverwrites.edit(target, { SendMessages: false });

      const embed = createUserLockEmbed(moderator, target);
      await channel.send({ embeds: [embed] });

      await sendModLog(guild, {
        action: "User Lock",
        target: target.user,
        moderator,
        reason: `Usuário bloqueado de enviar mensagens no canal ${channel}`,
        channel
      });

      console.info(`[Service: ChannelUserLock] Usuário ${target.id} bloqueado no canal ${channel.id}.`);

    } catch (error) {
      console.error(`[Service: ChannelUserLock] Erro ao bloquear usuário ${target.id} no canal ${channel.id}:`, error);
      throw error;
    }
  }
}

module.exports = ChannelUserLockService;

