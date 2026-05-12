"use strict";

const { sendWarning } = require("@embeds");
const { ChannelSlowmodeService } = require("@services");

module.exports = {
  name: "slowmode",
  description: "Define o tempo de espera entre mensagens em um canal de texto.",
  usage: "${currentPrefix}slowmode <tempo (ex: 10s, 1m, 1h, 0s)> [motivo]",
  category: "Moderação",
  userPermissions: ["ManageChannels"],
  botPermissions: ["ManageChannels"],
  deleteMessage: true,

  async execute(message, args) {
    const tempo = args[0];
    const motivo = args.slice(1).join(" ").trim() || "Sem motivo fornecido.";

    if (!tempo) {
      return sendWarning(message, "Você deve fornecer um tempo válido. Ex: `10s`, `5m`, `0s`.");
    }

    try {
      await ChannelSlowmodeService.apply({
        guild: message.guild,
        channel: message.channel,
        moderator: message.author,
        tempo,
        reason: motivo
      });
    } catch (error) {
      console.error(`[Command: slowmode] Erro ao aplicar modo lento no canal ${message.channel.id}:`, error);
      await sendWarning(message, "Ocorreu um erro ao aplicar o modo lento. Verifique se o bot tem as permissões adequadas.");
    }
  },
};
