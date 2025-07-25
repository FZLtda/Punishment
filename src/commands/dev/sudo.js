'use strict';

const { sendEmbed } = require('@utils/embedReply');
const { bot } = require('@config');

module.exports = {
  name: 'sudo',
  description: 'Executa um comando como se fosse outro usuário.',
  usage: '${currentPrefix}sudo <@usuário> <comando> [args]',
  category: 'Administrador',
  deleteMessage: true,

  /**
   * Executa o comando sudo.
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
  
  async execute(message, args) {
    
    if (message.author.id !== bot.owner) return;

    const targetUser = message.mentions.users.first() || message.client.users.cache.get(args[0]);
    if (!targetUser) {
      return sendEmbed('yellow', message, 'Não foi possível encontrar esse usuário.');
    }

    const commandName = args[1];
    if (!commandName) {
      return sendEmbed('yellow', message, 'Você precisa especificar o comando a ser executado.');
    }

    const command = message.client.commands.get(commandName);
    if (!command) {
      return sendEmbed('yellow', message, `Comando \`${commandName}\` não encontrado.`);
    }

    const targetMember = await message.guild.members.fetch(targetUser.id).catch(() => null);
    if (!targetMember) {
      return sendEmbed('yellow', message, 'Não foi possível encontrar esse usuário.');
    }

    const fakeMessage = Object.create(message);
    fakeMessage.author = targetUser;
    fakeMessage.content = `${message.client.prefix}${commandName} ${args.slice(2).join(' ')}`;

    Object.defineProperty(fakeMessage, 'member', {
      get: () => targetMember,
    });

    Object.defineProperty(fakeMessage, 'user', {
      get: () => targetUser,
    });

    try {
      await command.execute(fakeMessage, args.slice(2));
    } catch (error) {
      console.error('[sudo] Erro ao executar comando:', error);
      return sendEmbed('yellow', message, 'Não foi possível executar o comando.');
    }
  }
};
