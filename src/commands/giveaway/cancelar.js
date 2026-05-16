"use strict";

const { 
  EmbedBuilder, 
  PermissionsBitField 
} = require("discord.js");
const { sendWarning } = require("@embeds");
const { Giveaway } = require("@models");
const { colors, emojis } = require("@config");
const logger = require("@logger");

module.exports = {
  name: "cancelar",
  description: "Cancela manualmente um sorteio ativo.",
  usage: "${currentPrefix}cancelar <ID da mensagem>",
  category: "Utilidades",
  userPermissions: ["ManageMessages"],
  botPermissions: ["SendMessages"],
  deleteMessage: true,

  async execute(message, args) {
    if (!message.guild) return;

    const msgId = args[0];

    if (!msgId || !/^\d{17,20}$/.test(msgId)) {
      logger.warn(
        `[CANCELAR] ID inválido fornecido por ${message.author.tag} (${message.author.id})`
      );

      return sendWarning(
        message,
        "Informe um ID de mensagem válido do sorteio que deseja cancelar."
      );
    }

    const sorteio = await Giveaway.findOne({
      messageId: msgId,
      guildId: message.guild.id,
      status: "ativo",
    });

    if (!sorteio) {
      logger.warn(
        `[CANCELAR] Sorteio não encontrado ou fora do servidor | ID: ${msgId} | Guild: ${message.guild.id}`
      );

      return sendWarning(
        message,
        "Não há sorteio ativo neste servidor correspondente a este ID."
      );
    }

    const isCreator = sorteio.createdBy === message.author.id;
    const isAdmin = message.member.permissions.has(
      PermissionsBitField.Flags.Administrator
    );

    if (!isCreator && !isAdmin) {
      logger.warn(
        `[CANCELAR] Tentativa não autorizada por ${message.author.tag} (${message.author.id})`
      );

      return sendWarning(
        message,
        "Apenas o criador do sorteio ou um administrador pode cancelá-lo."
      );
    }

    sorteio.status = "cancelado";
    await sorteio.save();

    try {
      const canal = await message.guild.channels
        .fetch(sorteio.channelId)
        .catch(() => null);

      if (canal?.isTextBased()) {
        const mensagem = await canal.messages
          .fetch(sorteio.messageId)
          .catch(() => null);

        if (mensagem) {
          const embedCancelado = new EmbedBuilder()
            .setTitle(`${emojis.errorEmoji} Sorteio Cancelado`)
            .setDescription(
              "Este sorteio foi **cancelado pela administração**.\n" +
              "A ação segue as regras do servidor, garantindo organização e transparência."
            )
            .addFields({
              name: "🎁 Prêmio",
              value: sorteio.prize,
              inline: false,
            })
            .setColor(colors.red)
            .setFooter({
              text: "Punishment",
              iconURL: message.client.user.displayAvatarURL(),
            })
            .setTimestamp();

          await mensagem.edit({ embeds: [embedCancelado] }).catch(() => null);
          await mensagem.reactions.removeAll().catch(() => null);
        }
      }

      if (message.channel.id !== sorteio.channelId) {
        const confirm = new EmbedBuilder()
          .setColor(colors.green)
          .setDescription(
            `${emojis.successEmoji} Sorteio **cancelado com sucesso**.`
          );

        await message.channel.send({
          embeds: [confirm],
          allowedMentions: { repliedUser: false },
        });
      }

      logger.info(
        `[CANCELAR] Sorteio "${sorteio.prize}" (${msgId}) cancelado por ${message.author.tag} (${message.author.id})`
      );
    } catch (err) {
      logger.error(
        `[CANCELAR] Erro ao cancelar sorteio | ID: ${msgId} | ${err.stack || err.message}`
      );

      return sendWarning(
        message,
        "O sorteio foi cancelado, mas não foi possível atualizar a mensagem original."
      );
    }
  },
};
