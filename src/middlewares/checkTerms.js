const TermsAgreement = require('@models/TermsAgreement');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { TERMS_URL } = process.env;

module.exports = async function checkTerms(interaction) {
  if (!interaction.isCommand()) return true;

  const alreadyAccepted = await TermsAgreement.findOne({ userId: interaction.user.id });
  if (alreadyAccepted) return true;

  const embed = new EmbedBuilder()
    .setColor('#FE3838')
    .setTitle('Termos de Uso')
    .setDescription('Para continuar utilizando o bot, você precisa aceitar os termos de uso.')
    .setFooter({ text: 'Punishment', iconURL: interaction.client.user.displayAvatarURL() });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Ver Termos')
      .setStyle(ButtonStyle.Link)
      .setURL(TERMS_URL),

    new ButtonBuilder()
      .setCustomId('terms_accept')
      .setLabel('Concordo')
      .setStyle(ButtonStyle.Success)
  );

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  return false;
};
