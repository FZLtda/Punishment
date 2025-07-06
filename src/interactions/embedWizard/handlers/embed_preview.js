'use strict';

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getSession } = require('../sessionStore');

module.exports = {
  customId: 'embed_preview',

  async execute(interaction) {
    const sessao = getSession(interaction.user.id);
    if (!sessao || !sessao.embed)
      return interaction.reply({ content: 'Sessão não encontrada ou embed incompleta.', ephemeral: true });

    const { titulo, descricao, cor } = sessao.embed;

    const preview = new EmbedBuilder()
      .setTitle(titulo || '📌 Título não definido')
      .setDescription(descricao || '💬 Descrição não definida')
      .setColor(cor || '#2F3136')
      .setFooter({ text: '📦 Preview da Embed' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('embed_send')
        .setLabel('📤 Enviar')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('embed_restart')
        .setLabel('🔁 Reiniciar')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('embed_cancel')
        .setLabel('❌ Cancelar')
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      content: '👁️ Aqui está a pré-visualização da embed:',
      embeds: [preview],
      components: [row],
      ephemeral: true
    });
  }
};
