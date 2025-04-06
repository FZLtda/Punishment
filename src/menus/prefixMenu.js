const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = async (interaction, client) => {
  const modal = new ModalBuilder()
    .setCustomId('prefix-config-modal')
    .setTitle('Configurar Prefixo');

  const input = new TextInputBuilder()
    .setCustomId('new-prefix')
    .setLabel('Novo prefixo')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(3)
    .setRequired(true);

  const row = new ActionRowBuilder().addComponents(input);
  modal.addComponents(row);

  await interaction.showModal(modal);
};
