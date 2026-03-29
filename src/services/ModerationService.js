"use strict";

const { sendModLog } = require("@modules/modlog");
const { createMuteEmbed } = require("@embeds");
const { formatVerboseDuration } = require("@utils/timeUtils");

class ModerationService {
  static async applyMute({ target, moderator, durationMs, rawTime, reason, channel }) {
    
    await target.timeout(durationMs, reason);

    try {
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
      }).catch(err => console.error("[ModerationService] Erro ao enviar ModLog:", err.message));

      if (channel) {
        const embed = createMuteEmbed(moderator, target, duracaoFormatadaEmbed, reason);
        await channel.send({ embeds: [embed] }).catch(err => 
          console.error("[ModerationService] Erro ao enviar resposta no canal:", err.message)
        );
      }
      
    } catch (sideEffectError) {
      console.error("[ModerationService] Erro crítico em efeitos colaterais:", sideEffectError);
    }
  }
}

module.exports = ModerationService;
