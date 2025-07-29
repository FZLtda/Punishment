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
    if (!Array.isArray(categories) || categories.length === 0) {
      return interaction.reply({
        content: '❌ Nenhuma categoria de ajuda foi encontrada.',
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('📘 Punishment - Help Menu')
      .setColor(colors.red || 0xED4245)
      .setDescription('Selecione uma **categoria de comandos** abaixo para ver os detalhes.\n\n🔧 Moderação, 🎛️ Utilidades, ⚙️ Configurações — tudo explicado em um só lugar.')
      .setFooter({ text: 'Alaska Help System' });

    const options = categories
      .filter(cat => cat && typeof cat.id === 'string') // garante validade
      .map(cat => ({
        label: cat.name,
        description: cat.description,
        value: cat.id,
        emoji: cat.emoji,
      }));

    const menu = new StringSelectMenuBuilder()
      .setCustomId('help-category')
      .setPlaceholder('Selecione uma categoria de comandos')
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
  },
};
