'use strict';

const { EmbedBuilder } = require('discord.js');
const categories = require('@utils/helpCategories');

module.exports = {
  customId: 'help-category',

  async execute(interaction) {
    const selected = interaction.values[0];
    const category = categories.find(c => c.id === selected);

    if (!category) {
      return interaction.reply({
        content: 'Categoria selecionada é inválida ou não encontrada.',
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor('#ED4245')
      .setTitle(`${category.emoji} ${category.name}`)
      .setDescription([
        `${category.description}`,
        '',
        ...category.commands.map(cmd =>
          `</${cmd.name}:${cmd.id}> — ${cmd.description}`
        )
      ].join('\n'))
      .setFooter({
        text: 'funczero.xyz',
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.update({
      embeds: [embed],
      components: [],
    });
  },
};
