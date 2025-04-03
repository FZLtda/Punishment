const { generateEmbed } = require('../utils/generateEmbed');
const { generateButtons } = require('../utils/generateButtons');
const { ActionRowBuilder } = require('discord.js');

async function handleHelpInteraction(embedMessage, message, commands, commandsPerPage, totalPages, uniqueId) {
  const collector = embedMessage.createMessageComponentCollector({
    filter: (interaction) => {
      if (interaction.user.id !== message.author.id) {
        interaction.reply({
          content: '❌ Apenas o autor do comando pode usar esses botões.',
          ephemeral: true,
        });
        return false;
      }
      return interaction.customId.startsWith(uniqueId); // Garante que o botão pertence a esta instância
    },
    time: 60000, // 1 minuto
  });

  let currentPage = 1;

  collector.on('collect', async (interaction) => {
    const action = interaction.customId.split('-')[2]; // Obtém a ação (first, previous, next, last)

    if (action === 'first') currentPage = 1;
    if (action === 'previous') currentPage--;
    if (action === 'next') currentPage++;
    if (action === 'last') currentPage = totalPages;

    await interaction.update({
      embeds: [generateEmbed(commands, currentPage, commandsPerPage, totalPages, message)],
      components: [generateButtons(currentPage, totalPages, uniqueId)],
    });
  });

  collector.on('end', () => {
    embedMessage.edit({
      components: [
        new ActionRowBuilder().addComponents(
          generateButtons(currentPage, totalPages, uniqueId).components.map((button) =>
            button.setDisabled(true)
          )
        ),
      ],
    });
  });
}

module.exports = { handleHelpInteraction };