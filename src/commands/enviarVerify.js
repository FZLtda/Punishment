const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.resolve(__dirname, '../data/verificationConfig.json');

module.exports = {
  name: 'enviar-verificação',
  description: 'Envia a mensagem de verificação configurada.',
  async execute(message) {
    if (!fs.existsSync(configPath)) {
      return message.reply('O sistema de verificação não foi configurado ainda.');
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    const embed = new EmbedBuilder()
      .setTitle('Verificação')
      .setDescription(config.message || 'Clique no botão abaixo para verificar sua conta.')
      .setColor(config.color || '#00FF00');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('verify_button')
        .setLabel(config.button?.text || 'Verificar')
        .setEmoji(config.button?.emoji || '')
        .setStyle(ButtonStyle.Primary)
    );

    await message.channel.send({ embeds: [embed], components: [row] });
  },
};