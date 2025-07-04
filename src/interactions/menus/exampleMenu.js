
'use strict';

const { EmbedBuilder } = require('discord.js');
const Logger = require('@logger');
const { colors, emojis } = require('@config');

module.exports = {
  customId: 'example_menu',

  /**
   * Executa um menu de exemplo (StringSelectMenu)
   * @param {import('discord.js').SelectMenuInteraction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client) {
    const selected = interaction.values[0];

    Logger.info(`[MENU] ${interaction.user.tag} selecionou: ${selected}`);

    const embed = new EmbedBuilder()
      .setTitle('Opção Selecionada')
      .setColor(colors.blue)
      .setDescription(`Você selecionou: **${selected}**`)
      .setFooter({ text: 'Menu de Seleção', iconURL: client.user.displayAvatarURL() });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
