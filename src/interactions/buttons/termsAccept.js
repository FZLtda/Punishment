const TermsAgreement = require('@models/TermsAgreement');
const { EmbedBuilder } = require('discord.js');
const { bot, emojis, colors } = require('@config');

module.exports = {
  customId: 'terms_accept',

  /**
   * Executa ao clicar no botão de aceitar os termos
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  execute: async (interaction) => {
    const userId = interaction.user.id;

    const alreadyAccepted = await TermsAgreement.findOne({ userId });
    if (alreadyAccepted) {
      return interaction.reply({
        content: `${emojis.attent} Você já aceitou os termos anteriormente.`,
        ephemeral: true
      });
    }

    await TermsAgreement.create({ userId });

    const embed = new EmbedBuilder()
      .setColor(colors.green)
      .setTitle(`${emojis.success} Termos aceitos`)
      .setDescription('Agora você tem acesso completo aos meus comandos.')
      .setFooter({
        text: bot.name,
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });

    if (interaction.message?.deletable) {
      setTimeout(() => {
        interaction.message.delete().catch(() => {});
      }, 1000);
    }
  }
};
