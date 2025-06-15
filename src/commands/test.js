const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');
const { buildHelpEmbed } = require('../utils/embedUtils');
const { getAllCategories } = require('../utils/cmdUtils');
const { createPaginatorRow, handlePaginatorInteraction } = require('../utils/paginatorUtils');

module.exports = {
  name: 'test',
  description: 'Exibe todos os comandos organizados por categoria.',
  usage: '.help',
  category: 'Utilidade',
  userPermissions: [],
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message) {
    const categories = getAllCategories();
    if (!categories.length) return message.reply('Nenhuma categoria encontrada.');

    let index = 0;
    const currentCategory = categories[index];
    const embed = buildHelpEmbed(currentCategory);
    const row = createPaginatorRow();

    const sent = await message.channel.send({ embeds: [embed], components: [row] });

    const collector = sent.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 120000,
    });

    collector.on('collect', async (interaction) => {
      if (interaction.user.id !== message.author.id) return interaction.deferUpdate();
      const action = interaction.customId;
      const result = handlePaginatorInteraction(action, index, categories.length);
      if (result.end) return sent.edit({ components: [] });
      index = result.index;
      const updatedEmbed = buildHelpEmbed(categories[index]);
      await interaction.update({ embeds: [updatedEmbed] });
    });

    collector.on('end', () => sent.edit({ components: [] }).catch(() => null));
    if (message.deletable) message.delete().catch(() => null);
  },
};
