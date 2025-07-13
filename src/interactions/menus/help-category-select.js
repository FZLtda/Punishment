'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis, bot } = require('@config');

module.exports = {
  customId: 'help-category-select',

  async execute(interaction) {
    const value = interaction.values?.[0];
    let embed;

    switch (value) {
      case 'mod':
        embed = new EmbedBuilder()
          .setTitle('🔨 Categoria: Moderação')
          .setDescription([
            '> **Comandos disponíveis:**',
            '',
            '- `/ban` — Banir um usuário',
            '- `/kick` — Expulsar um usuário',
            '- `/mute` — Silenciar alguém',
            '- `/unban`, `/warn`, `/slowmode`, e outros'
          ].join('\n'))
          .setColor(colors.red);
        break;

      case 'utils':
        embed = new EmbedBuilder()
          .setTitle('🧰 Categoria: Utilitários')
          .setDescription([
            '> **Comandos disponíveis:**',
            '',
            '- `/userinfo`',
            '- `/serverinfo`',
            '- `/ping`',
            '- `/avatar`, etc.'
          ].join('\n'))
          .setColor(colors.red);
        break;

      case 'config':
        embed = new EmbedBuilder()
          .setTitle('⚙️ Categoria: Configuração')
          .setDescription([
            '> **Comandos disponíveis:**',
            '',
            '- `/setprefix`',
            '- `/setwelcome`',
            '- `/setlogs`, entre outros'
          ].join('\n'))
          .setColor(colors.red);
        break;

      case 'fun':
        embed = new EmbedBuilder()
          .setTitle('🎉 Categoria: Diversão')
          .setDescription([
            '> **Comandos disponíveis:**',
            '',
            '- `/joke`',
            '- `/8ball`',
            '- `/meme`, e outros'
          ].join('\n'))
          .setColor(colors.red);
        break;

      default:
        // Defer update para evitar erro se a interação já foi respondida
        await interaction.deferUpdate();
        return;
    }

    await interaction.update({
      embeds: [embed],
      components: [],
    });
  },
};
