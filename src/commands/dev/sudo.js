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
   * Executa um comando como outro usuário.
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
  async execute(message, args) {
    if (message.author.id !== bot.owner) return;

    const sudoUser = message.mentions.users.first() || message.client.users.cache.get(args[0]);
    if (!sudoUser) {
      return sendEmbed('yellow', message, 'Usuário para simular não encontrado.');
    }

    const commandName = args[1]?.toLowerCase();
    if (!commandName) {
      return sendEmbed('yellow', message, 'Você precisa especificar o comando a ser executado.');
    }

    const command = message.client.commands.get(commandName);
    if (!command) {
      return sendEmbed('yellow', message, `Comando \`${commandName}\` não encontrado.`);
    }

    const sudoMember = await message.guild.members.fetch(sudoUser.id).catch(() => null);
    if (!sudoMember) {
      return sendEmbed('yellow', message, 'Não foi possível encontrar o membro no servidor.');
    }

    const mentionsOriginal = [...message.mentions.users.values()];
    const commandArgs = args.slice(2);

    const targetMentions = mentionsOriginal.filter(user => user.id !== sudoUser.id);

    const mentionedUsers = new Map();
    const mentionedMembers = new Map();

    for (const user of targetMentions) {
      mentionedUsers.set(user.id, user);
      const member = await message.guild.members.fetch(user.id).catch(() => null);
      if (member) mentionedMembers.set(user.id, member);
    }

    const fakeMessage = Object.create(message);

    fakeMessage.author = sudoUser;
    fakeMessage.member = sudoMember;
    fakeMessage.content = `${message.client.prefix}${commandName} ${commandArgs.join(' ')}`;
    fakeMessage.guild = message.guild;

    fakeMessage.mentions = {
      users: mentionedUsers,
      members: mentionedMembers,
    };

    try {
      await command.execute(fakeMessage, commandArgs);
    } catch (error) {
      console.error('[sudo] Erro ao executar comando:', error);
      return sendEmbed('red', message, 'Ocorreu um erro ao executar o comando.');
    }
  }
};
