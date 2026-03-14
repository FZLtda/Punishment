"use strict";

const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { sendWarning } = require("@embeds/embedWarning");
const { colors } = require("@config");
const Giveaway = require("@models/Giveaway");
const logger = require("@logger");

module.exports = {
  name: "rerolar",
  description: "Sorteia novamente os vencedores de um sorteio encerrado.",
  usage: "${currentPrefix}rerolar <ID da mensagem>",
  category: "Utilidades",
  userPermissions: ["ManageMessages"],
  botPermissions: ["SendMessages"],
  deleteMessage: true,

  async execute(message, args) {
    const msgId = args[0];

    /* Validação do ID */
    if (!msgId || !/^\d{17,20}$/.test(msgId)) {
      logger.warn(
        `[REROLL] ID inválido fornecido por ${message.author.tag} (${message.author.id})`
      );

      return sendWarning(
        message,
        "Informe um **ID de mensagem válido** do sorteio que deseja rerolar."
      );
    }

    /* Busca por servidor */
    let sorteio;
    try {
      sorteio = await Giveaway.findOne({
        messageId: msgId,
        guildId: message.guild.id,
        status: "finalizado",
      });
    } catch (error) {
      logger.error(
        `[REROLL] Erro ao buscar sorteio | ID: ${msgId} | ${error.stack || error.message}`
      );

      return sendWarning(
        message,
        "Ocorreu um erro interno ao buscar o sorteio."
      );
    }

    if (!sorteio) {
      logger.warn(
        `[REROLL] Sorteio não encontrado ou fora do servidor | ID: ${msgId} | Guild: ${message.guild.id}`
      );

      return sendWarning(
        message,
        "Não há sorteio encerrado neste servidor correspondente a este ID."
      );
    }

    /* Autorização */
    const isCreator = sorteio.createdBy === message.author.id;
    const isAdmin = message.member.permissions.has(
      PermissionsBitField.Flags.Administrator
    );

    if (!isCreator && !isAdmin) {
      logger.warn(
        `[REROLL] Tentativa não autorizada por ${message.author.tag} (${message.author.id})`
      );

      return sendWarning(
        message,
        "Apenas o criador do sorteio ou um administrador podem rerolá-lo."
      );
    }

    /* Processo de reroll */
    const participantes = Array.isArray(sorteio.participants)
      ? [...sorteio.participants]
      : [];

    if (participantes.length === 0) {
      return sendWarning(
        message,
        "Este sorteio não possui participantes suficientes para rerolar."
      );
    }

    const ganhadores = [];
    const totalWinners = Math.min(sorteio.winners, participantes.length);

    for (let i = 0; i < totalWinners; i++) {
      const index = Math.floor(Math.random() * participantes.length);
      const escolhido = participantes.splice(index, 1)[0];
      if (escolhido) ganhadores.push(`<@${escolhido}>`);
    }

    /* Pluralização */
    const winnersLabel =
      ganhadores.length === 1 ? "Novo ganhador" : "Novos ganhadores";

    const rerollEmbed = new EmbedBuilder()
      .setTitle("🔁 Sorteio Rerolado")
      .setDescription(
        `**Prêmio:** ${sorteio.prize}\n` +
        `**${winnersLabel}:** ${ganhadores.join(", ")}`
      )
      .setColor(colors.red)
      .setTimestamp()
      .setFooter({
        text: "Punishment",
        iconURL: message.client.user.displayAvatarURL(),
      });

    logger.info(
      `[REROLL] Sorteio "${sorteio.prize}" (${msgId}) rerolado por ${message.author.tag} (${message.author.id}) | Ganhadores: ${ganhadores.length}`
    );

    return message.channel.send({
      embeds: [rerollEmbed],
      allowedMentions: { parse: [] },
    });
  },
};
