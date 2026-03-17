"use strict";

const { emojis } = require("@config");
const { sendModLog } = require("@modules/modlog");
const { sendWarning } = require("@embeds/embedWarning");

module.exports = {
  name: "clear",
  description: "Apaga mensagens do canal, com opção de filtrar por usuário.",
  usage: "${currentPrefix}clear <quantidade> [@usuário]",
  aliases: ["apagar", "limpar"],
  userPermissions: ["ManageMessages"],
  botPermissions: ["ManageMessages"],
  deleteMessage: true,

  async execute(message, args) {
    const quantidade = parseInt(args[0], 10);
    const alvo = message.mentions.users.first();

    if (!quantidade || isNaN(quantidade) || quantidade < 1 || quantidade > 1000) {
      return sendWarning(message, "Forneça um valor entre 1 e 1000 para apagar mensagens.");
    }

    let totalApagadas = 0;

    try {
      while (totalApagadas < quantidade) {
        const restante = quantidade - totalApagadas;
        const limite = restante > 100 ? 100 : restante;

        const mensagens = await message.channel.messages.fetch({ limit: 100 });
        if (!mensagens.size) break;

        const filtradas = mensagens.filter(msg => {
          const dentroLimite = (Date.now() - msg.createdTimestamp) < 14 * 24 * 60 * 60 * 1000;
          const correspondeAlvo = !alvo || msg.author.id === alvo.id;
          return correspondeAlvo && !msg.pinned && dentroLimite;
        });

        const mensagensParaApagar = Array.from(filtradas.values()).slice(0, limite);
        if (!mensagensParaApagar.length) break;

        const apagadas = await message.channel.bulkDelete(mensagensParaApagar, true);
        totalApagadas += apagadas.size;

        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const resposta = await message.channel.send({
        content: `${emojis.done} ${totalApagadas} mensagens foram apagadas${alvo ? ` de ${alvo}` : ""}.`,
        allowedMentions: { users: [] }
      });

      setTimeout(() => resposta.delete().catch(() => null), 4000);

      await sendModLog(message.guild, {
        action: "Clear",
        moderator: message.author,
        channel: message.channel,
        extra: `${totalApagadas} mensagens apagadas${alvo ? ` de ${alvo.tag}` : ""}`
      });

    } catch (error) {
      console.error(error);
      return sendWarning(message, "Não foi possível apagar as mensagens devido a um erro.");
    }
  }
};
