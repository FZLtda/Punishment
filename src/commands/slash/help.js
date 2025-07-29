'use strict';

const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require('discord.js');

const { colors } = require('@config');
const categories = require('@utils/helpCategories');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Exibe o menu de ajuda com categorias e comandos.'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📘 Punishment - Help Menu')
      .setDescription([
        'Selecione uma **categoria de comandos** abaixo para ver os detalhes, exemplos e permissões.',
        '',
        '🔧 Moderação, 🎛️ Utilidades, ⚙️ Configurações — tudo explicado em um só lugar.',
      ].join('\n'))
      .setColor(colors.red)
      .setFooter({ text: 'Alaska Help System' });

    const menu = new StringSelectMenuBuilder()
      .setCustomId('help-category')
      .setPlaceholder('Selecione uma categoria de comandos')
      .addOptions(
        categories.map(cat => ({
          label: cat.name,
          description: cat.description,
          value: cat.id,
          emoji: cat.emoji,
        }))
      );

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
  },
};
