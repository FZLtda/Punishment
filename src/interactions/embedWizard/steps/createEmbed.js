'use strict';

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { updateSession } = require('../sessionStore');

module.exports = {
  /**
   * Inicia o fluxo de criação da embed
   */
  async start(interaction) {
    await updateSession(interaction.user.id, {
      step: 'embed_title',
      embed: {}
    });

    const embed = new EmbedBuilder()
      .setTitle('📌 Criando uma nova Embed')
      .setDescription('Vamos começar configurando o **título** da sua embed.\n\nClique no botão abaixo para fornecer o título.')
      .setColor('#5865F2');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('embed_set_title')
        .setLabel('➕ Definir Título')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('embed_cancel')
        .setLabel('❌ Cancelar')
        .setStyle(ButtonStyle.Danger)
    );

    return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
};
