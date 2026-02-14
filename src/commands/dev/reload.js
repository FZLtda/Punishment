'use strict';

const fs               = require('fs');
const path             = require('path');
const { bot, emojis }  = require('@config');
const { sendWarning }  = require('@embeds/sendWarning');

module.exports = {
  name: 'reload',
  aliases: ['rl'],
  description: 'Recarrega comandos, eventos ou todos os módulos do bot.',
  usage: 'reload <command|event|all> [nome]',
  category: 'Administrador',
  deleteMessage: true,

  async execute(message, args) {
    if (message.author.id !== bot.ownerId) return;

    const client = message.client;
    const type = args[0]?.toLowerCase();
    const target = args[1]?.toLowerCase();

    const validTypes = ['command', 'commands', 'comando', 'event', 'events', 'all'];

    if (!type || !validTypes.includes(type)) {
      return sendWarning(
        message,
        'Uso correto: `reload <command|event|all> [nome]`'
      );
    }

    try {
      if (type === 'all') {
        const commandsDir = path.resolve(__dirname, '..', '..', 'commands');
        const eventsDir = path.resolve(__dirname, '..', '..', 'events');

        await reloadDirectory(commandsDir, client.commands, 'command');
        await reloadDirectory(eventsDir, client, 'event');

        return message.channel.send(
          `${emojis.done} Todos os módulos foram recarregados com sucesso.`
        );
      }

      if (['command', 'commands', 'comando'].includes(type)) {
        if (!target)
          return sendWarning(message, 'Especifique o nome do comando.');

        const command =
          client.commands.get(target) ||
          client.commands.find(cmd => cmd.aliases?.includes(target));

        if (!command)
          return sendWarning(message, `Comando \`${target}\` não encontrado.`);

        const filePath = findFile(
          path.resolve(__dirname, '..', '..', 'commands'),
          command.name
        );

        if (!filePath)
          return sendWarning(message, `Arquivo do comando não encontrado.`);

        delete require.cache[require.resolve(filePath)];
        client.commands.delete(command.name);

        const updatedCommand = require(filePath);

        if (!updatedCommand?.name || typeof updatedCommand.execute !== 'function') {
          throw new Error('Estrutura inválida do comando.');
        }

        client.commands.set(updatedCommand.name, updatedCommand);

        return message.channel.send(
          `${emojis.done} Comando **${updatedCommand.name}** recarregado com sucesso.`
        );
      }

      if (['event', 'events'].includes(type)) {
        if (!target)
          return sendWarning(message, 'Especifique o nome do evento.');

        const eventsDir = path.resolve(__dirname, '..', '..', 'events');
        const filePath = findFile(eventsDir, target);

        if (!filePath)
          return sendWarning(message, `Evento \`${target}\` não encontrado.`);

        delete require.cache[require.resolve(filePath)];

        const updatedEvent = require(filePath);

        if (!updatedEvent?.name || typeof updatedEvent.execute !== 'function') {
          throw new Error('Estrutura inválida do evento.');
        }

        client.removeAllListeners(updatedEvent.name);

        if (updatedEvent.once) {
          client.once(updatedEvent.name, (...args) =>
            updatedEvent.execute(...args, client)
          );
        } else {
          client.on(updatedEvent.name, (...args) =>
            updatedEvent.execute(...args, client)
          );
        }

        return message.channel.send(
          `${emojis.done} Evento **${updatedEvent.name}** recarregado com sucesso.`
        );
      }
    } catch (error) {
      console.error('[RELOAD ERROR]', error);

      return sendWarning(
        message,
        `Ocorreu um erro ao recarregar o módulo.\n\`\`\`${error.message}\`\`\``
      );
    }
  },
};

async function reloadDirectory(directory, collection, type) {
  const files = getAllFiles(directory);

  for (const file of files) {
    delete require.cache[require.resolve(file)];

    const module = require(file);

    if (type === 'command') {
      if (!module?.name) continue;
      collection.set(module.name, module);
    }

    if (type === 'event') {
      if (!module?.name || typeof module.execute !== 'function') continue;

      collection.removeAllListeners(module.name);

      if (module.once) {
        collection.once(module.name, (...args) =>
          module.execute(...args, collection)
        );
      } else {
        collection.on(module.name, (...args) =>
          module.execute(...args, collection)
        );
      }
    }
  }
}

function findFile(directory, name) {
  const files = getAllFiles(directory);
  return files.find(file => path.basename(file, '.js') === name);
}

function getAllFiles(dir) {
  let results = [];

  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath));
    } else if (file.endsWith('.js')) {
      results.push(fullPath);
    }
  }

  return results;
}
