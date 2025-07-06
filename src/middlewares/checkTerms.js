const TermsAgreement = require('@models/TermsAgreement');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { TERMS_URL } = process.env;

module.exports = async function checkTerms(context) {
  const user = context.user;

  const alreadyAccepted = await TermsAgreement.findOne({ userId: user.id });
  if (alreadyAccepted) return true;

  const embed = new EmbedBuilder()
    .setColor('#FE3838')
    .setTitle('Termos de Uso')
    .setDescription('Para continuar utilizando o **Punishment**, você precisa aceitar os **Termos de Uso**.')
    .setFooter({ text: 'Punishment', iconURL: context.client.user.displayAvatarURL() });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Ler Termos de Uso')
      .setStyle(ButtonStyle.Link)
      .setURL(TERMS_URL),
    new ButtonBuilder()
      .setCustomId('terms_accept')
      .setLabel('Aceitar Termos de Uso')
      .setStyle(ButtonStyle.Success)
  );

  // Se for interaction real
  if (typeof context.reply === 'function' && 'deferReply' in context) {
    await context.reply({ embeds: [embed], components: [row], ephemeral: true });
    return false;
  }

  // Se for message simulada (prefix)
  if (typeof context.reply === 'function') {
    await context.reply({ embeds: [embed], components: [row] });
    return false;
  }

  return false;
};
