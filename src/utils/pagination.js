const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} = require('discord.js');

module.exports.createPagination = async (interaction, pages) => {
  let page = 0;

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('prev').setEmoji('⬅️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('next').setEmoji('➡️').setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [pages[page]], components: [row] });

  const msg = await interaction.fetchReply();

  const collector = msg.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 60_000,
    filter: i => i.user.id === interaction.user.id
  });

  collector.on('collect', async i => {
    if (i.customId === 'prev') page = page > 0 ? page - 1 : pages.length - 1;
    if (i.customId === 'next') page = page + 1 < pages.length ? page + 1 : 0;

    await i.update({ embeds: [pages[page]], components: [row] });
  });

  collector.on('end', () => {
    msg.edit({ components: [] }).catch(() => {});
  });
};
