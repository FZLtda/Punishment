'use strict';

const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const { sendWarning } = require('@embeds/embedWarning');
const { bot, colors } = require('@config');

module.exports = {
  name: 'reload',
  description: 'Recarrega comandos, eventos ou todos os módulos do bot.',
  usage: '${currentPrefix}reload <comando|event|all>',
  category: 'Administrador',
  deleteMessage: true,

  /**
   * Recarrega comandos ou eventos dinamicamente.
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
  
  async execute(message, args) {
    if (message.author.id !== bot.ownerId) return;

    const type = args[0]?.toLowerCase();
    const target = args[1]?.toLowerCase();
    const validTypes = ['command', 'comando', 'event', 'all'];

    if (!type || !validTypes.includes(type)) {
      return sendWarning(message, 'Uso correto: `reload <comando|event|all>`');
    }

    try {
      if (type === 'all') {
        const commandsDir = path.resolve(__dirname, '..', '..', 'commands');
        const eventsDir = path.resolve(__dirname, '..', '..', 'events');

        await reloadAll(commandsDir, message.client.commands, 'command');
        await reloadAll(eventsDir, message.client.events, 'event');

        return sendSuccess(message, 'Todos os comandos e eventos foram recarregados com sucesso.');
      }

      if (type === 'command' || type === 'comando') {
        if (!target) return sendWarning(message, 'Especifique o nome do comando.');

        const command = message.client.commands.get(target);
        if (!command) return sendWarning(message, `Comando \`${target}\` não encontrado.`);

        const commandsDir = path.resolve(__dirname, '..', '..', 'commands');
        const commandFile = findCommandFile(commandsDir, command.name);
        if (!commandFile) return sendWarning(message, `Arquivo do comando \`${command.name}\` não encontrado.`);

        delete require.cache[require.resolve(commandFile)];
        message.client.commands.delete(command.name);

        const updatedCommand = require(commandFile);
        message.client.commands.set(updatedCommand.name, updatedCommand);

        return sendSuccess(message, `Comando \`${updatedCommand.name}\` recarregado com sucesso.`);
      }

      if (type === 'event') {
        if (!target) return sendWarning(message, 'Especifique o nome do evento.');

        const eventsDir = path.resolve(__dirname, '..', '..', 'events');
        const eventFile = findEventFile(eventsDir, target);
        if (!eventFile) return sendWarning(message, `Evento \`${target}\` não encontrado.`);

        delete require.cache[require.resolve(eventFile)];
        const updatedEvent = require(eventFile);
        const eventName = path.basename(eventFile, '.js');

        message.client.removeAllListeners(eventName);
        message.client.on(eventName, updatedEvent.execute.bind(null));

        return sendSuccess(message, `Evento \`${eventName}\` recarregado com sucesso.`);
      }
    } catch (error) {
      console.error('[reload] Erro ao recarregar:', error);
      return sendWarning(message, 'Não foi possível recarregar o módulo.');
    }
  },
};

/**
 * Envia embed manual apenas para mensagens de sucesso.
 */
function sendSuccess(message, text) {
  const embed = new EmbedBuilder()
    .setColor(colors.green)
    .setDescription(text);

  return message.channel.send({ embeds: [embed] });
}

/**
 * Recarrega todos os arquivos .js de um diretório recursivamente.
 */
function getAllJsFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries.flatMap(entry => {
    const res = path.resolve(dir, entry.name);
    return entry.isDirectory()
      ? getAllJsFiles(res)
      : res.endsWith('.js') ? [res] : [];
  });
}

/**
 * Recarrega dinamicamente todos os comandos ou eventos.
 */
async function reloadAll(basePath, collection, type) {
  const files = getAllJsFiles(basePath);

  for (const file of files) {
    delete require.cache[require.resolve(file)];

    const mod = require(file);
    if (type === 'command') {
      collection.set(mod.name, mod);
    } else if (type === 'event') {
      const eventName = path.basename(file, '.js');
      collection.client?.removeAllListeners?.(eventName);
      collection.client?.on?.(eventName, mod.execute.bind(null));
    }
  }
}

/**
 * Localiza o caminho real do comando baseado no nome.
 */
function findCommandFile(dir, commandName) {
  const files = getAllJsFiles(dir);
  return files.find(file => path.basename(file, '.js') === commandName);
}

/**
 * Localiza o caminho real do evento baseado no nome.
 */
function findEventFile(dir, eventName) {
  const files = getAllJsFiles(dir);
  return files.find(file => path.basename(file, '.js') === eventName);
        }
