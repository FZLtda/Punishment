'use strict';

const fs = require('fs');
const path = require('path');
const { sendEmbed } = require('@utils/embedReply');
const { bot } = require('@config');

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
    if (message.author.id !== bot.owner) return;

    const type = args[0]?.toLowerCase();
    const target = args[1]?.toLowerCase();

    if (!type || !['comando', 'comando', 'command', 'event', 'all'].includes(type)) {
      return sendEmbed('yellow', message, 'Uso correto: `reload <comando|event|all>`');
    }

    try {
      if (type === 'all') {
        const commandsPath = path.resolve(__dirname, '..', '..', 'commands');
        await reloadAll(commandsPath, message.client.commands, 'command');

        const eventsPath = path.resolve(__dirname, '..', '..', 'events');
        await reloadAll(eventsPath, message.client.events, 'event');

        return sendEmbed('green', message, 'Todos os comandos e eventos foram recarregados com sucesso.');
      }

      if (type === 'command' || type === 'comando') {
        if (!target) return sendEmbed('yellow', message, 'Especifique o comando que deseja recarregar.');

        const command = message.client.commands.get(target);
        if (!command) return sendEmbed('red', message, `Comando \`${target}\` não encontrado.`);

        const commandPath = require.resolve(path.resolve(__dirname, '..', command.category.toLowerCase(), `${command.name}.js`));
        delete require.cache[commandPath];
        message.client.commands.delete(command.name);

        const newCommand = require(commandPath);
        message.client.commands.set(newCommand.name, newCommand);

        return sendEmbed('green', message, `Comando \`${newCommand.name}\` recarregado com sucesso.`);
      }

      if (type === 'event') {
        if (!target) return sendEmbed('yellow', message, 'Especifique o nome do evento.');

        const eventPath = path.resolve(__dirname, '..', '..', 'events');
        const file = findEventFile(eventPath, target);
        if (!file) return sendEmbed('yellow', message, `Evento \`${target}\` não encontrado.`);

        const fullPath = require.resolve(file);
        delete require.cache[fullPath];

        const newEvent = require(fullPath);
        const eventName = path.basename(file, '.js');

        message.client.removeAllListeners(eventName);
        message.client.on(eventName, newEvent.execute.bind(null));

        return sendEmbed('green', message, `Evento \`${eventName}\` recarregado com sucesso.`);
      }

    } catch (error) {
      console.error('[reload] Erro ao recarregar:', error);
      return sendEmbed('yellow', message, 'Ocorreu um erro ao recarregar o módulo.');
    }
  }
};

/**
 * Recarrega todos os arquivos de um diretório recursivamente.
 */
async function reloadAll(basePath, collection, type) {
  const files = getAllJsFiles(basePath);

  for (const file of files) {
    const fullPath = require.resolve(file);
    delete require.cache[fullPath];

    const mod = require(fullPath);
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
 * Busca todos os arquivos .js de forma recursiva.
 */
function getAllJsFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = entries.flatMap(entry => {
    const res = path.resolve(dir, entry.name);
    return entry.isDirectory() ? getAllJsFiles(res) : res.endsWith('.js') ? [res] : [];
  });
  return files;
}

/**
 * Procura o caminho do arquivo de evento pelo nome.
 */
function findEventFile(dir, eventName) {
  const files = getAllJsFiles(dir);
  return files.find(file => path.basename(file, '.js') === eventName);
}
