'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis, bot } = require('@config');

module.exports = {
  customId: 'help-category-select',

  async execute(interaction) {
    const value = interaction.values[0];
    let embed;

    switch (value) {
      case 'mod':
        embed = new EmbedBuilder()
          .setTitle('🔨 Categoria: Moderação')
          .setDescription(`> **Comandos disponíveis:**\n\n- \`/ban\` — Banir um usuário\n- \`/kick\` — Expulsar um usuário\n- \`/mute\` — Silenciar alguém\n- \`/unban\`, \`/warn\`, \`/slowmode\`, e outros`)
          .setColor(colors.red);
        break;

      case 'utils':
        embed = new EmbedBuilder()
          .setTitle('🧰 Categoria: Utilitários')
          .setDescription(`> **Comandos disponíveis:**\n\n- \`/userinfo\`\n- \`/serverinfo\`\n- \`/ping\`\n- \`/avatar\`, etc.`)
          .setColor(colors.red);
        break;

      case 'config':
        embed = new EmbedBuilder()
          .setTitle('⚙️ Categoria: Configuração')
          .setDescription(`> **Comandos disponíveis:**\n\n- \`/setprefix\`\n- \`/setwelcome\`\n- \`/setlogs\`, entre outros`)
          .setColor(colors.red);
        break;

      case 'fun':
        embed = new EmbedBuilder()
          .setTitle('🎉 Categoria: Diversão')
          .setDescription(`> **Comandos disponíveis:**\n\n- \`/joke\`\n- \`/8ball\`\n- \`/meme\`, e outros`)
          .setColor(colors.red);
        break;

      default:
        return interaction.reply({ content: 'Categoria inválida.', flags: 1 << 6 });
    }

    await interaction.update({
      embeds: [embed],
      components: [],
    });
  },
};
