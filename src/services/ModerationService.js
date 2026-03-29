"use strict";

const { sendModLog } = require("@modules/modlog");
const { createMuteEmbed } = require("@embeds/moderation/muteEmbed");
const { formatVerboseDuration } = require("@utils/timeUtils");

class ModerationService {
  /**
   * Aplica timeout em um usuário, gera logs e envia aviso no canal.
   * @param {Object} params
   * @param {import('discord.js').GuildMember} params.target - O membro a ser silenciado.
   * @param {import('discord.js').User} params.moderator - O moderador que executou a ação.
   * @param {number} params.durationMs - Duração em milissegundos.
   * @param {string} params.rawTime - Tempo original em string (ex: "10m").
   * @param {string} params.reason - Motivo da punição.
   * @param {import('discord.js').TextChannel} [params.channel] - Canal para enviar o embed de feedback (opcional).
   * @throws {Error} Lança um erro se a API do Discord falhar.
   */
  static async applyMute({ target, moderator, durationMs, rawTime, reason, channel }) {
    await target.timeout(durationMs, reason);

    const tempoExtenso = formatVerboseDuration(rawTime);
    const terminaEmUnix = Math.floor((Date.now() + durationMs) / 1000);
    const duracaoFormatadaEmbed = `\`${tempoExtenso}\``;

    await sendModLog(target.guild, {
      action: "Mute",
      target: target.user,
      moderator: moderator,
      reason: reason,
      extraFields: [
        { name: "Duração", value: duracaoFormatadaEmbed, inline: true },
        { name: "Expira em", value: `<t:${terminaEmUnix}:f>`, inline: true }
      ]
    });

    if (channel) {
      const embed = createMuteEmbed(moderator, target, duracaoFormatadaEmbed, reason);
      await channel.send({ embeds: [embed] });
    }
  }
}

module.exports = ModerationService;

