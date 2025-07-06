const TermsAgreement = require('@models/TermsAgreement');
const { EmbedBuilder } = require('discord.js');

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
        content: 'Você já aceitou os termos anteriormente.',
        ephemeral: true
      });
    }

    await TermsAgreement.create({ userId });

    const embed = new EmbedBuilder()
      .setColor('Green')
      .setTitle('Termos aceitos')
      .setDescription('Agora você tem acesso completo aos comandos do Punishment.')
      .setFooter({ text: 'Punishment' });

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
