'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');
const categories = require('@utils/helpCategories');

module.exports = {
  customId: 'help-category',

  async execute(interaction) {
    const selected = interaction.values[0];
    const category = categories.find(c => c.id === selected);

    if (!category) {
      return interaction.reply({
        content: 'Categoria inválida.',
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`${category.emoji} ${category.name}`)
      .setColor(colors.red || 0xED4245)
      .setAuthor({
        name: 'Comando de ajuda',
        iconURL: emojis.helpIcon,
      })
      .setDescription(category.commands.map(cmd => (
        `**.${cmd.name}**\n` +
        `> ${cmd.description}\n`
      )).join('\n'))
      .setFooter({ text: `${category.name} • Total: ${category.commands.length} comando(s)` });

    await interaction.update({
      embeds: [embed],
      components: [],
    });
  },
};
