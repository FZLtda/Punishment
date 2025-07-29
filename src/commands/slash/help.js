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
    .setDescription('Exibe o painel de comandos categorizados do Punishment.'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(colors.red)
      .setTitle('📂 Central de Comandos')
      .setDescription([
        'Use `.help <comando>` para obter detalhes sobre um comando específico.',
        '',
        ...categories.map(cat =>
          `**${cat.emoji} ${cat.name}**\n${cat.commands.map(cmd => `\`${cmd.name}\``).join(', ')}`).join('\n\n')
      ])
      .setFooter({
        text: 'funczero.xyz',
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

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
