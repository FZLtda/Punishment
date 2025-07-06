'use strict';

const { EmbedBuilder } = require('discord.js');
const { getSession, resetSession } = require('../sessionStore');

module.exports = {
  customId: 'embed_channel_select',

  async execute(interaction) {
    const sessao = getSession(interaction.user.id);
    if (!sessao || !sessao.embed)
      return interaction.reply({ content: '❌ Sessão inválida. Reinicie com `/embed`.', ephemeral: true });

    const [canal] = interaction.values;
    const channel = interaction.guild.channels.cache.get(canal);
    if (!channel || !channel.send)
      return interaction.reply({ content: '❌ Canal inválido ou não suportado.', ephemeral: true });

    const { titulo, descricao, cor } = sessao.embed;

    const embedFinal = new EmbedBuilder()
      .setTitle(titulo || '📌')
      .setDescription(descricao || '💬')
      .setColor(cor || '#2F3136');

    try {
      await channel.send({ embeds: [embedFinal] });
      await resetSession(interaction.user.id);

      return interaction.reply({
        content: `✅ Mensagem publicada com sucesso em ${channel}.`,
        ephemeral: true
      });

    } catch (err) {
      console.error('[EMBED SEND] Erro ao enviar embed:', err);
      return interaction.reply({ content: '❌ Falha ao enviar a mensagem.', ephemeral: true });
    }
  }
};
