const TermsAgreement = require('@models/TermsAgreement');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { bot, colors } = require('@config');
const { TERMS_URL } = process.env;

module.exports = async function checkTerms(context) {
  const user = context.user;

  const alreadyAccepted = await TermsAgreement.findOne({ userId: user.id });
  if (alreadyAccepted) return true;

  const embed = new EmbedBuilder()
    .setColor(colors.green)
    .setTitle('Termos de Uso')
    .setDescription(`Para continuar utilizando o **${bot.name}**, você precisa aceitar os **Termos de Uso**.`)
    .setFooter({
      text: bot.name,
      iconURL: context.client.user.displayAvatarURL()
    })
    .setTimestamp();

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

  const payload = {
    embeds: [embed],
    components: [row],
    allowedMentions: { repliedUser: false }
  };

  // Slash commands (interactions)
  if (typeof context.reply === 'function' && 'deferReply' in context) {
    await context.reply({ ...payload, ephemeral: true });
    return false;
  }

  // Prefix commands (mensagem normal)
  if (typeof context.reply === 'function') {
    await context.reply(payload);
    return false;
  }

  return false;
};
