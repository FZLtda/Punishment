"use strict";

const { sendModLog } = require("@modules/modlog");
const { createUnmuteEmbed } = require("@embeds");

class ChannelUnmuteService {
  static async unmute({ guild, channel, moderator, target, reason }) {
    if (!guild || !channel || !target) {
      throw new Error("Guild, canal ou usuário inválido para unmute.");
    }

    if (!target.communicationDisabledUntilTimestamp) {
      throw new Error("Este usuário não está silenciado no momento.");
    }

    try {
      await target.timeout(0, reason);

      const embed = createUnmuteEmbed(moderator, target, reason);
      await channel.send({ embeds: [embed] });

      await sendModLog(guild, {
        action: "Unmute",
        target: target.user,
        moderator,
        reason,
      });

      console.info(`[Service: ChannelUnmute] Usuário ${target.id} teve o mute removido.`);
    } catch (error) {
      console.error(`[Service: ChannelUnmute] Erro ao remover mute do usuário ${target.id}:`, error);
      throw error;
    }
  }
}

module.exports = ChannelUnmuteService;
