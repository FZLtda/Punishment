'use strict';

const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const { bot, colors, emojis } = require('@config');
const categories = require('@helpers/helpCategories');
const { sendWarning } = require('@embeds/embedWarning');

module.exports = {
  name: 'help',
  description: 'Mostra todos os comandos disponíveis e como utilizá-los.',
  usage: 'help',
  category: 'util',

  async execute(message, args, client) {
    if (!Array.isArray(categories) || categories.length === 0) {
      return sendWarning(message, 'Nenhuma categoria de ajuda foi encontrada.');
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
      return sendWarning(message, 'Nenhuma categoria válida foi encontrada.');
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: 'Central de Recursos',
        iconURL: emojis.helpIcon,
      })
      .setColor(colors.red)
      .setDescription([
        '```',
        `${bot.name} - Help Menu`,
        '```',
        '>>> Selecione uma categoria abaixo para exibir os comandos disponíveis, exemplos de uso e permissões.',
        '',
        'Você verá tudo — desde ferramentas de moderação até recursos de personalização do servidor.',
      ].join('\n'));

    const menu = new StringSelectMenuBuilder()
      .setCustomId('help-category')
      .setPlaceholder('Selecione uma categoria de comandos')
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(options);

    const menuRow = new ActionRowBuilder().addComponents(menu);

    const buttonsRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Me Adicione')
        .setStyle(ButtonStyle.Link)
        .setURL(
          'https://discord.com/oauth2/authorize?client_id=1155843839932764253&permissions=8&integration_type=0&scope=applications.commands+bot'
        ),
      new ButtonBuilder()
        .setCustomId('help_close')
        .setLabel('Fechar')
        .setStyle(ButtonStyle.Danger)
    );

    return message.reply({
      embeds: [embed],
      components: [menuRow, buttonsRow],
      allowedMentions: { repliedUser: false },
    });
  },
};
