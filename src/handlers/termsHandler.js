const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../data/database');

async function checkTerms(interaction) {
  const userId = interaction.user.id;

  const userAccepted = db.prepare('SELECT * FROM terms WHERE user_id = ?').get(userId);
  if (userAccepted) return true;

  const embed = new EmbedBuilder()
    .setColor('#FE3838')
    .setTitle('Termos de Uso')
    .setDescription(
      'Para usar este bot, você precisa aceitar os Termos de Uso.\n\n' +
      '**Termos:**\n' +
      '1. Você concorda em não abusar das funcionalidades do bot.\n' +
      '2. Você concorda que suas ações podem ser registradas para fins de moderação.\n\n' +
      'Clique no botão abaixo para aceitar os Termos de Uso.'
    )
    .setFooter({ text: 'Punishment', iconURL: interaction.client.user.displayAvatarURL() });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('accept_terms')
      .setLabel('Aceitar Termos')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('decline_terms')
      .setLabel('Recusar Termos')
      .setStyle(ButtonStyle.Danger)
  );

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  return false;
}

async function handleTermsInteraction(interaction) {
  const userId = interaction.user.id;

  if (interaction.customId === 'accept_terms') {
    db.prepare('INSERT INTO terms (user_id) VALUES (?)').run(userId);

    await interaction.update({
      content: 'Você aceitou os Termos de Uso. Agora pode usar o bot!',
      components: [],
      embeds: [],
    });
  } else if (interaction.customId === 'decline_terms') {
    await interaction.update({
      content: 'Você recusou os Termos de Uso. Não poderá usar o bot.',
      components: [],
      embeds: [],
    });
  }
}

module.exports = { checkTerms, handleTermsInteraction };