'use strict';

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getSession, updateSession } = require('../sessionStore');

module.exports = {
  customId: 'modal_embed_title',

  async execute(interaction) {
    const titulo = interaction.fields.getTextInputValue('input_embed_title');
    const userId = interaction.user.id;

    const sessao = getSession(userId);
    if (!sessao) return interaction.reply({ content: 'Sessão não encontrada.', ephemeral: true });

    await updateSession(userId, {
      embed: { ...sessao.embed, titulo },
      step: 'embed_description'
    });

    const preview = new EmbedBuilder()
      .setTitle(titulo)
      .setDescription('📄 Descrição ainda não definida...')
      .setColor('#5865F2');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('embed_set_description')
        .setLabel('➕ Definir Descrição')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('embed_cancel')
        .setLabel('❌ Cancelar')
        .setStyle(ButtonStyle.Danger)
    );

    return interaction.reply({
      content: '✅ Título definido! Agora vamos para a descrição:',
      embeds: [preview],
      components: [row],
      ephemeral: true
    });
  }
};
