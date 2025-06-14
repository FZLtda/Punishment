const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} = require('discord.js');

async function createPagination(interaction, pages) {
  let page = 0;

  const row = () => new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('prev').setLabel('⬅️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('next').setLabel('➡️').setStyle(ButtonStyle.Secondary)
  );

  const msg = await interaction.update({ embeds: [pages[page]], components: [row()] });

  const collector = msg.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 60000,
    filter: i => i.user.id === interaction.user.id
  });

  collector.on('collect', async i => {
    i.customId === 'next' ? page++ : page--;
    if (page < 0) page = pages.length - 1;
    if (page >= pages.length) page = 0;

    await i.update({ embeds: [pages[page]], components: [row()] });
  });

  collector.on('end', () => {
    msg.edit({ components: [] }).catch(() => {});
  });
}

module.exports = { createPagination };
