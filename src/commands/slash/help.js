'use strict';

const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require('discord.js');

const { colors, emojis } = require('@config');
const categories = require('@utils/helpCategories');
const { sendWarning } = require('@utils/embedWarning');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Exibe o menu de ajuda com categorias e comandos.'),

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
        name: 'Comando de ajuda',
        iconURL: emojis.helpIcon
      })
      .setTitle('Punishment - Help Menu')
      .setColor(colors.red || '#FE3838')
      .setDescription([
        '```',
        'Punishment - Help Menu',
        '```',
        '>>> Selecione uma categoria abaixo para exibir os comandos disponíveis, exemplos de uso e permissões.',
        '',
        'Você verá tudo — desde ferramentas de moderação até recursos de personalização do servidor.'
      ].join('\n'));

    const menu = new StringSelectMenuBuilder()
      .setCustomId('help-category')
      .setPlaceholder('Selecione uma categoria de comandos')
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(menu);

    return interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
  },
};
