'use strict';

const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const { sendWarning } = require('@embeds/embedWarning');
const { bot, colors, emojis } = require('@config');

module.exports = {
  name: 'reload',
  description: 'Recarrega comandos, eventos ou todos os módulos do bot.',
  usage: 'reload <comando|event|all>',
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

    const validTypes = ['command', 'commands', 'comando', 'event', 'events', 'all'];

    if (!type || !validTypes.includes(type)) {
      return sendWarning(message, 'Uso correto: `reload <comando|event|all>`');
    }

    try {
      if (type === 'all') {
        const commandsDir = path.resolve(__dirname, '..', '..', 'commands');
        const eventsDir = path.resolve(__dirname, '..', '..', 'events');

        await reloadAll(commandsDir, message.client.commands, 'command');
        await reloadAll(eventsDir, message.client.events, 'event');

        return sendSuccess(
          message,
          `${emojis.successEmoji} Todos os comandos e eventos foram recarregados com sucesso.`
        );
      }

      if (type === 'command' || type === 'commands' || type === 'comando') {
        if (!target) return sendWarning(message, 'Especifique o nome do comando.');

        const command = message.client.commands.get(target);
        if (!command) {
          return sendWarning(message, `Comando \`${target}\` não encontrado.`);
        }

        const commandsDir = path.resolve(__dirname, '..', '..', 'commands');
        const commandFile = findCommandFile(commandsDir, command.name);

        if (!commandFile) {
          return sendWarning(message, `Arquivo do comando \`${command.name}\` não encontrado.`);
        }

        delete require.cache[require.resolve(commandFile)];
        message.client.commands.delete(command.name);

        const updatedCommand = require(commandFile);
        message.client.commands.set(updatedCommand.name, updatedCommand);

        return sendSuccess(
          message,
          `${emojis.successEmoji} Comando \`${updatedCommand.name}\` recarregado com sucesso.`
        );
      }

      if (type === 'event' || type === 'events') {
        if (!target) return sendWarning(message, 'Especifique o nome do evento.');

        const eventsDir = path.resolve(__dirname, '..', '..', 'events');
        const eventFile = findEventFile(eventsDir, target);

        if (!eventFile) {
          return sendWarning(message, `Evento \`${target}\` não encontrado.`);
        }

        delete require.cache[require.resolve(eventFile)];

        const updatedEvent = require(eventFile);
        const eventName = path.basename(eventFile, '.js');

        message.client.removeAllListeners(eventName);
        message.client.on(eventName, updatedEvent.execute.bind(null));

        return sendSuccess(
          message,
          `${emojis.successEmoji} Evento \`${eventName}\` recarregado com sucesso.`
        );
      }
    } catch (error) {
      console.error('[reload] Erro ao recarregar:', error);
      return sendWarning(message, 'Não foi possível recarregar o módulo.');
    }
  },
};

function sendSuccess(message, text) {
  const embed = new EmbedBuilder()
    .setColor(colors.green)
    .setDescription(text);

  return message.channel.send({ embeds: [embed] });
}

function getAllJsFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries.flatMap(entry => {
    const res = path.resolve(dir, entry.name);
    return entry.isDirectory()
      ? getAllJsFiles(res)
      : res.endsWith('.js') ? [res] : [];
  });
}

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

function findCommandFile(dir, commandName) {
  return getAllJsFiles(dir).find(
    file => path.basename(file, '.js') === commandName
  );
}

function findEventFile(dir, eventName) {
  return getAllJsFiles(dir).find(
    file => path.basename(file, '.js') === eventName
  );
}
