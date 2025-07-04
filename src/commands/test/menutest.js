'use strict';

const {
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');

module.exports = {
  name: 'menutest',
  description: 'Exibe um menu de seleção com opções fictícias.',
  usage: '!menutest',
  permissions: ['SendMessages'],

  /**
   * @param {import('discord.js').Client} client
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
  async execute(message, args, client) {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('example_menu')
      .setPlaceholder('Escolha uma opção...')
      .addOptions(
        {
          label: 'Informações',
          description: 'Exibir informações úteis',
          value: 'info'
        },
        {
          label: 'Configurações',
          description: 'Ajustar suas preferências',
          value: 'settings'
        },
        {
          label: 'Sair',
          description: 'Fechar o menu',
          value: 'exit'
        }
      );

    const row = new ActionRowBuilder().addComponents(menu);

    await message.channel.send({
      content: 'Selecione uma opção no menu abaixo:',
      components: [row]
    });
  }
};
