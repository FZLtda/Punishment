'use strict';

const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const { colors, emojis, bot } = require('@config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('Veja o menu de ajuda com comandos e categorias'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle(`${emojis.help} Help Command`)
      .setDescription(`### ${bot.name} - Help Menu\n\nSelecione uma categoria no menu abaixo para ver informações detalhadas, exemplos de uso e permissões.\n\nVocê verá desde ferramentas de moderação até funções de personalização do servidor — tudo explicado em um só lugar.`)
      .setColor(colors.red)
      .setFooter({ text: `Executado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help-category-select')
      .setPlaceholder('Selecione uma Categoria de Comando')
      .addOptions([
        {
          label: 'Moderação',
          description: 'Comandos de punição, banimento, kick etc.',
          value: 'mod',
          emoji: '🔨',
        },
        {
          label: 'Utilitários',
          description: 'Ferramentas úteis e gerais do servidor.',
          value: 'utils',
          emoji: '🧰',
        },
        {
          label: 'Configuração',
          description: 'Comandos para configurar o bot.',
          value: 'config',
          emoji: '⚙️',
        },
        {
          label: 'Diversão',
          description: 'Comandos engraçados e interativos.',
          value: 'fun',
          emoji: '🎉',
        },
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      embeds: [embed],
      components: [row],
      flags: 1 << 6,
    });
  },
};
