'use strict';

const { EmbedBuilder } = require('discord.js');
const { getSession, updateSession } = require('../sessionStore');

const cores = {
  color_red: '#FE3838',
  color_blue: '#5865F2',
  color_green: '#3BA55C',
  color_default: '#2F3136'
};

module.exports = {
  customId: /^color_/, // regex support se seu router permitir

  async execute(interaction) {
    const cor = cores[interaction.customId];
    if (!cor) return interaction.reply({ content: 'Cor inválida.', ephemeral: true });

    const sessao = getSession(interaction.user.id);
    if (!sessao) return interaction.reply({ content: 'Sessão não encontrada.', ephemeral: true });

    const embedAtualizada = {
      ...sessao.embed,
      cor
    };

    await updateSession(interaction.user.id, {
      embed: embedAtualizada,
      step: 'preview'
    });

    const preview = new EmbedBuilder()
      .setTitle(embedAtualizada.titulo || '📌 Embed sem título')
      .setDescription(embedAtualizada.descricao || '💬 Sem descrição definida')
      .setColor(cor);

    await interaction.reply({
      content: '✅ Cor aplicada. Aqui está o preview atual:',
      embeds: [preview],
      ephemeral: true
    });
  }
};
