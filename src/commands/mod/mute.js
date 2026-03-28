"use strict";

const { sendWarning } = require("@embeds/embedWarning");
const { checkMemberGuard } = require("@permissions/memberGuards");
const { sendModLog } = require("@modules/modlog");
const { convertToMilliseconds } = require("@utils/convertToMilliseconds");
const { createMuteEmbed } = require("@embeds/moderation/muteEmbed");

/**
 * Converte uma string de tempo (ex: "1m", "2d") para sua representação por extenso.
 * @param {string} input - A string de tempo original.
 * @returns {string} - O tempo formatado por extenso.
 */
const formatVerboseDuration = (input) => {
  const match = input.toLowerCase().match(/^(\d+)(s|m|h|d)$/);
  if (!match) return input;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const labels = {
    s: value === 1 ? "segundo" : "segundos",
    m: value === 1 ? "minuto" : "minutos",
    h: value === 1 ? "hora" : "horas",
    d: value === 1 ? "dia" : "dias"
  };

  return `${value} ${labels[unit]}`;
};

module.exports = {
  name: "mute",
  description: "Aplica um timeout (mute) em um membro.",
  userPermissions: ["ModerateMembers"],
  botPermissions: ["ModerateMembers"],
  deleteMessage: true,

  async execute(message, args) {
    const membro =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]);

    const isValid = await checkMemberGuard(message, membro, "mute");
    if (!isValid) return;

    const tempo = args[1];
    const motivo = args.slice(2).join(" ") || "Não especificado.";

    if (!tempo) {
      return sendWarning(
        message,
        "Defina um tempo de duração para o mute (ex: `1m`, `1h`, `1d`)."
      );
    }

    const duracao = convertToMilliseconds(tempo);

    if (!duracao) {
      return sendWarning(
        message,
        "Duração inválida. Use `s`, `m`, `h`, `d` (ex: `10m`, `1h`)."
      );
    }

    const tempoExtenso = formatVerboseDuration(tempo);
    const terminaEmUnix = Math.floor((Date.now() + duracao) / 1000);

    const duracaoFormatadaEmbed = `\`${tempoExtenso}\``;

    try {
      await membro.timeout(duracao, motivo);

      const embed = createMuteEmbed(
        message,
        membro,
        duracaoFormatadaEmbed,
        motivo
      );

      await message.channel.send({ embeds: [embed] });

      await sendModLog(message.guild, {
        action: "Mute",
        target: membro.user,
        moderator: message.author,
        reason: motivo,
        extraFields: [
          { name: "Duração", value: `\`${tempoExtenso}\``, inline: true },
          { name: "Expira em", value: `<t:${terminaEmUnix}:f>`, inline: true }
        ]
      });
    } catch (error) {
      console.error("[mute] Erro ao aplicar timeout:", error);

      return sendWarning(
        message,
        "Não foi possível silenciar o usuário devido a um erro inesperado."
      );
    }
  }
};
