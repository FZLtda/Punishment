"use strict";

const { TermsAgreement } = require("@models");
const { EmbedBuilder } = require("discord.js");
const { bot, emojis, colors } = require("@config");

module.exports = {
  customId: "terms_accept",

  async execute(interaction) {
    try {
      const { user, client, message } = interaction;
      const userId = user.id;

      const alreadyAccepted = await TermsAgreement.findOne({ userId });
      if (alreadyAccepted) {
        return await interaction.reply({
          content: `${emojis.attentionEmoji} Você já aceitou os termos anteriormente.`,
          flags: 1 << 6
        });
      }

      await TermsAgreement.create({ userId });

      const successEmbed = new EmbedBuilder()
        .setColor(colors.green)
        .setTitle(`${emojis.successEmoji} Termos Aceitos`)
        .setDescription("Agora você tem acesso completo às minhas funcionalidades.")
        .setFooter({
          text: bot.name,
          iconURL: client.user.displayAvatarURL()
        })
        .setTimestamp();

      await interaction.reply({
        embeds: [successEmbed],
        flags: 1 << 6
      });

      if (message?.deletable) {
        setTimeout(() => {
          message.delete().catch(() => {});
        }, 1000);
      }
    } catch (error) {
      console.error("[TERMS_BUTTON] Erro ao processar aceitação de termos:", error);
      if (!interaction.replied) {
        await interaction.reply({
          content: `${emojis.attentionEmoji} Não foi possível processar sua aceitação dos termos.`,
          flags: 1 << 6
        });
      }
    }
  }
};
