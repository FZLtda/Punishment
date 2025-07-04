'use strict';

const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require('discord.js');

module.exports = {
  name: 'modaltest',
  description: 'Exibe um modal com campos de feedback.',
  usage: '!modaltest',
  permissions: ['SendMessages'],

  /**
   * @param {import('discord.js').Client} client
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
  async execute(message, args, client) {
    if (!message.guild) return;

    const modal = new ModalBuilder()
      .setCustomId('example_modal')
      .setTitle('Formulário de Feedback');

    const nameInput = new TextInputBuilder()
      .setCustomId('name_input')
      .setLabel('Seu nome')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const feedbackInput = new TextInputBuilder()
      .setCustomId('feedback_input')
      .setLabel('Escreva seu feedback')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(nameInput),
      new ActionRowBuilder().addComponents(feedbackInput)
    );

    try {
      await message.channel.send({
        content: 'Clique no botão abaixo para abrir o modal.',
        components: [
          new ActionRowBuilder().addComponents({
            type: 2, // BUTTON
            customId: 'open_example_modal',
            style: 1, // PRIMARY
            label: 'Abrir Modal'
          })
        ]
      });

    } catch (err) {
      console.error('Erro ao enviar botão do modal:', err);
    }
  }
};
