'use strict';

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

module.exports = {
  name: 'modaltest',
  description: 'Exibe botão para abrir um modal de feedback',
  usage: '!modaltest',
  permissions: ['SendMessages'],

  /**
   * @param {import('discord.js').Client} client
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
  async execute(message, args, client) {
    try {
      const button = new ButtonBuilder()
        .setCustomId('open_example_modal')
        .setLabel('Abrir Modal')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      await message.channel.send({
        content: 'Clique no botão abaixo para abrir o modal:',
        components: [row]
      });
    } catch (err) {
      console.error('Erro ao enviar botão do modal:', err);
    }
  }
};
