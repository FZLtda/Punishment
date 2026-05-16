"use strict";

const { sendWarning } = require("@embeds");
const { checkMemberGuard } = require("@permissions");
const { convertToMilliseconds } = require("@utils/timeUtils"); 
const { ChannelMuteService } = require("@services");

module.exports = {
  name: "mute",
  description: "Aplica um timeout (mute) em um membro.",
  userPermissions: ["ModerateMembers"],
  botPermissions: ["ModerateMembers"],
  deleteMessage: true,

  /**
   * @param {import('discord.js').Message} message 
   * @param {string[]} args 
   */
  async execute(message, args) {
    
    const targetId = message.mentions.members.first()?.id || args[0];
    if (!targetId) {
      return sendWarning(message, "Mencione um usuário válido para continuar.");
    }

    const membro = await message.guild.members.fetch(targetId).catch(() => null);
    if (!membro) {
      return sendWarning(message, "Membro não encontrado neste servidor.");
    }

    const isValid = await checkMemberGuard(message, membro, "mute");
    if (!isValid) return;

    const tempo = args[1];
    const motivo = args.slice(2).join(" ") || "Não especificado.";

    if (!tempo) {
      return sendWarning(message, "Defina um tempo de duração para o mute (ex: `1m`, `1h`, `1d`).");
    }

    const duracaoMs = convertToMilliseconds(tempo);

    if (!duracaoMs) {
      return sendWarning(message, "Duração inválida. Use `s`, `m`, `h`, `d` (ex: `10m`, `1h`).");
    }

    const vinteOitoDiasMs = 28 * 24 * 60 * 60 * 1000;
    if (duracaoMs > vinteOitoDiasMs) {
      return sendWarning(message, "O Discord permite um timeout máximo de apenas 28 dias.");
    }

    try {
      await ChannelMuteService.applyMute({
        target: membro,
        moderator: message.author,
        durationMs: duracaoMs,
        rawTime: tempo,
        reason: motivo,
        channel: message.channel 
      });
    } catch (error) {
      console.error(`[Command: mute] Falha ao mutar usuário ${membro.user.tag}:`, error);
      return sendWarning(message, "Não foi possível silenciar o usuário devido a um erro na API do Discord.");
    }
  }
};

