'use strict';

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getSession, updateSession } = require('../sessionStore');

module.exports = {
  customId: 'modal_embed_description',

  async execute(interaction) {
    const descricao = interaction.fields.getTextInputValue('input_embed_description');
    const userId = interaction.user.id;

    const sessao = getSession(userId);
    if (!sessao) return interaction.reply({ content: 'Sessão não encontrada.', ephemeral: true });

    const novoEmbed = {
      ...sessao.embed,
      descricao
    };

    await updateSession(userId, {
      embed: novoEmbed,
      step: 'embed_color'
    });

    const preview = new EmbedBuilder()
      .setTitle(novoEmbed.titulo || '📌 Embed sem título')
      .setDescription(descricao)
      .setColor('#5865F2');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('embed_set_color')
        .setLabel('🎨 Escolher Cor')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('embed_cancel')
        .setLabel('❌ Cancelar')
        .setStyle(ButtonStyle.Danger)
    );

    return interaction.reply({
      content: '✅ Descrição definida! Agora vamos escolher uma cor:',
      embeds: [preview],
      components: [row],
      ephemeral: true
    });
  }
};
