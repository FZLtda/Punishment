'use strict';

const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require('discord.js');

const { colors, emojis } = require('@config');
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

    const validOptions = categories
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

    if (validOptions.length === 0) {
      return interaction.reply({
        content: '❌ Nenhuma categoria válida foi encontrada.',
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setAuthor({ name: 'Comando de ajuda', 
        iconURL: 'https://cdn.discordapp.com/attachments/1267699137017806848/1399915033487609897/Picsart_25-07-29_21-42-19-238.png?ex=688abbf9&is=68896a79&hm=fe38f5cb80ff3262da3e8bef69a2abd976df12d4ba06efece33fd2ccbe74160b&' })
      .setColor('#FE3838')
      .setDescription([
        '```',
        'Punishment - Help Menu',
        '```',
        '>>> Selecione um comando no menu abaixo para exibir informações detalhadas, exemplos de uso e permissões.',
        '',
        'Você verá tudo, desde ferramentas de moderação até recursos de personalização do servidor, tudo explicado em um só lugar.'
      ].join('\n'))
      .setFooter({ text: 'Punishment Help' });

    const menu = new StringSelectMenuBuilder()
      .setCustomId('help-category')
      .setPlaceholder('Selecione uma categoria de comandos')
      .addOptions(validOptions);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
  },
};
