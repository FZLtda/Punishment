'use strict';

const { Collection } = require('discord.js');
const { bot } = require('@config');
const { sendWarning } = require('@embeds/embedWarning');

module.exports = {
  name: 'sudo',
  description: 'Executa um comando como se fosse outro usuário.',
  usage: '${currentPrefix}sudo <@usuário> <comando> [args]',
  category: 'Administrador',
  deleteMessage: true,

  /**
   * Executa um comando como outro usuário.
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
  
  async execute(message, args) {
    if (message.author.id !== bot.ownerId) return;

    const sudoUser = message.mentions.users.first() || message.client.users.cache.get(args[0]);
    if (!sudoUser) return sendWarning(message, 'Usuário para simular não encontrado.');

    const commandName = args[1]?.toLowerCase();
    if (!commandName) return sendWarning(message, 'Você precisa especificar o comando a ser executado.');

    const command = message.client.commands.get(commandName);
    if (!command) return sendWarning(message, `Comando \`${commandName}\` não encontrado.`);

    const sudoMember = await message.guild.members.fetch(sudoUser.id).catch(() => null);
    if (!sudoMember) return sendWarning(message, 'Não foi possível encontrar o membro no servidor.');

    const commandArgs = args.slice(2);
    const content = `${message.client.prefix}${commandName} ${commandArgs.join(' ')}`;

    const fakeMentionsUsers = new Collection();
    const fakeMentionsMembers = new Collection();

    for (const arg of commandArgs) {
      const match = arg.match(/^<@!?(\d+)>$/);
      if (!match) continue;

      const id = match[1];
      if (id === sudoUser.id) continue;

      const user = await message.client.users.fetch(id).catch(() => null);
      const member = await message.guild.members.fetch(id).catch(() => null);

      if (user) fakeMentionsUsers.set(id, user);
      if (member) fakeMentionsMembers.set(id, member);
    }

    const fakeMessage = Object.create(message);

    Object.defineProperty(fakeMessage, 'author', { get: () => sudoUser });
    Object.defineProperty(fakeMessage, 'member', { get: () => sudoMember });
    Object.defineProperty(fakeMessage, 'guild',  { get: () => message.guild });
    Object.defineProperty(fakeMessage, 'content',{ get: () => content });

    fakeMessage.mentions = {
      users: fakeMentionsUsers,
      members: fakeMentionsMembers,
    };

    try {
      await command.execute(fakeMessage, commandArgs);
    } catch (error) {
      console.error('[sudo] Erro ao executar comando:', error);
      return sendWarning(message, 'Não foi possível executar o comando.');
    }
  }
};
