const TermsAgreement = require('@models/TermsAgreement');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  customId: 'terms_accept',

  run: async (interaction) => {
    const userId = interaction.user.id;

    const alreadyAccepted = await TermsAgreement.findOne({ userId });
    if (alreadyAccepted) {
      return interaction.reply({ content: 'Você já aceitou os termos.', ephemeral: true });
    }

    await TermsAgreement.create({ userId });

    const embed = new EmbedBuilder()
      .setColor('Green')
      .setTitle('Termos aceitos')
      .setDescription('Você aceitou os termos de uso. Agora pode usar os comandos do bot!')
      .setFooter({ text: 'Punishment' });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
