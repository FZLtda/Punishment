'use strict';

const { EmbedBuilder } = require('discord.js');
const categories = require('@utils/helpCategories');

module.exports = {
  customId: 'help-category',

  async execute(interaction) {
    const selected = interaction.values[0];
    const category = categories.find(c => c.id === selected);

    if (!category) {
      return await interaction.reply({
        content: 'Categoria inválida.',
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`${category.emoji} ${category.name} Commands`)
      .setDescription(category.commands.map(cmd => `</${cmd.name}:${cmd.id}> — ${cmd.description}`).join('\n'))
      .setColor('#00BFFF')
      .setFooter({ text: 'Use os comandos com /' });

    await interaction.update({
      embeds: [embed],
      components: [],
    });
  },
};
