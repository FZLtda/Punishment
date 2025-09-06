'use strict';

const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require('discord.js');

const { bot, colors, emojis } = require('@config');
const categories = require('@helpers/helpCategories');
const { sendWarning } = require('@embeds/embedWarning');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Mostra todos os comandos disponíveis e como utilizá-los.'),

  async execute(interaction) {
    if (!Array.isArray(categories) || categories.length === 0) {
      return sendWarning(interaction, 'Nenhuma categoria de ajuda foi encontrada.');
    }

    const options = categories
      .filter(cat =>
        cat &&
        typeof cat.id === 'string' &&
        typeof cat.name === 'string' &&
        typeof cat.description === 'string'
      )
      .map(cat => ({
        label: cat.name,
        description: cat.description,
        value: cat.id,
        emoji: cat.emoji,
      }));

    if (options.length === 0) {
      return sendWarning(interaction, 'Nenhuma categoria válida foi encontrada.');
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: 'Central de Recursos',
        iconURL: emojis.helpIcon
      })
      .setColor(colors.red)
      .setDescription([
        '```',
        `${bot.name} - Help Menu`,
        '```',
        '>>> Selecione uma categoria abaixo para exibir os comandos disponíveis, exemplos de uso e permissões.',
        '',
        'Você verá tudo — desde ferramentas de moderação até recursos de personalização do servidor.'
      ].join('\n'));

    const menu = new StringSelectMenuBuilder()
      .setCustomId('help-category')
      .setPlaceholder('Selecione uma categoria de comandos')
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(menu);

    return interaction.reply({
      embeds: [embed],
      components: [row],
      flags: 1 << 6,
    });
  },
};
