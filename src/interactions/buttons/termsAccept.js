'use strict';

const TermsAgreement = require('@models/TermsAgreement');
const { EmbedBuilder } = require('discord.js');
const { bot, emojis, colors } = require('@config');

/**
 * Manipula o clique no botão de aceitar os Termos de Uso.
 */
module.exports = {
  customId: 'terms_accept',

  /**
   * Executa a lógica ao clicar no botão "Aceitar Termos".
   * @param {import('discord.js').ButtonInteraction} interaction
   * @returns {Promise<void>}
   */
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
        .setDescription('Agora você tem acesso completo às minhas funcionalidades.')
        .setFooter({
          text: bot.name,
          iconURL: client.user.displayAvatarURL()
        })
        .setTimestamp();

      await interaction.reply({
        embeds: [successEmbed],
        flags: 1 << 6
      });

      // Deleta a mensagem original após aceitar
      if (message?.deletable) {
        setTimeout(() => {
          message.delete().catch(() => {});
        }, 1000);
      }
    } catch (error) {
      console.error(`[TERMS_BUTTON] Erro ao processar aceitação de termos:`, error);
      if (!interaction.replied) {
        await interaction.reply({
          content: `${emoji.attentionEmoji} Não foi possível processar sua aceitação dos termos.`,
          flags: 1 << 6
        });
      }
    }
  }
};
