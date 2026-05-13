"use strict";

const { sendModLog } = require("@modules/modlog");
const { createUnmuteEmbed } = require("@embeds");

class ChannelUnmuteService {
  /**
   * Remove mute (timeout) de um membro.
   * @param {Object} params
   * @param {import("discord.js").Guild} params.guild
   * @param {import("discord.js").TextChannel} params.channel
   * @param {import("discord.js").User} params.moderator
   * @param {import("discord.js").GuildMember} params.target
   * @param {string} params.reason
   */
  static async unmute({ guild, channel, moderator, target, reason }) {
    try {
      await target.timeout(0, reason);

      const embed = createUnmuteEmbed(moderator, target, reason);
      await channel.send({ embeds: [embed] }).catch(err =>
        console.error("[ChannelUnmuteService] Erro ao enviar embed:", err.message)
      );

      await sendModLog(guild, {
        action: "unmute",
        target: target.user,
        moderator,
        reason,
      }).catch(err =>
        console.error("[ChannelUnmuteService] Erro ao enviar ModLog:", err.message)
      );

      console.info(`[ChannelUnmuteService] Usuário ${target.id} teve o mute removido com sucesso.`);
    } catch (error) {
      console.error(`[ChannelUnmuteService] Erro crítico ao remover mute do usuário ${target?.id}:`, error);
      throw error;
    }
  }
}

module.exports = ChannelUnmuteService;
