'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { formatUsage } = require('@utils/formatUsage');
const { getPrefix } = require('@utils/prefixManager');
const { embedSucesso, embedErro } = require('@utils/embeds');

module.exports = {
  name: 'help',
  description: 'Exibe todos os comandos disponíveis ou informações detalhadas de um comando específico.',
  usage: '${currentPrefix}help [comando]',
  deleteMessage: true,

  async execute(message, args) {
    const client = message.client;
    const prefix = await getPrefix(message.guild?.id);
    const input = args[0]?.toLowerCase();

    // Ajuda para um comando específico
    if (input) {
      const command =
        client.commands.get(input) ||
        client.commands.find(cmd => cmd.aliases?.includes(input));

      if (!command) {
        return message.channel.send({
          embeds: [
            embedErro({ descricao: `O comando \`${input}\` não foi encontrado.` })
          ],
        });
      }

      const usage = formatUsage(command.usage || 'Uso não especificado.', prefix);

      const embed = embedSucesso({
        descricao: `📖 Informações sobre o comando \`${command.name}\`:`,
        campos: [
          {
            name: 'Descrição',
            value: command.description || 'Sem descrição disponível.',
            inline: false
          },
          {
            name: 'Uso',
            value: `\`${usage}\``,
            inline: false
          },
          {
            name: 'Permissões',
            value: `👤 Usuário: ${command.userPermissions?.join(', ') || 'Nenhuma'}\n🤖 Bot: ${command.botPermissions?.join(', ') || 'Nenhuma'}`,
            inline: false
          }
        ]
      });

      return message.channel.send({ embeds: [embed] });
    }

    // Ajuda geral
    const categoriasPath = path.join(__dirname, '..');
    const categorias = fs.readdirSync(categoriasPath).filter(folder => {
      const fullPath = path.join(categoriasPath, folder);
      return fs.existsSync(fullPath) && fs.lstatSync(fullPath).isDirectory();
    });

    const embed = embedSucesso({
      descricao: `📚 Lista de comandos disponíveis.\nUse \`${prefix}help <comando>\` para mais detalhes.`,
    });

    for (const categoria of categorias.sort()) {
      const comandos = [];

      const categoriaPath = path.join(categoriasPath, categoria);
      const arquivos = fs.readdirSync(categoriaPath).filter(file => file.endsWith('.js'));

      for (const file of arquivos.sort()) {
        try {
          const comando = require(path.join(categoriaPath, file));
          if (!comando?.name || comando.private) continue;
          comandos.push(`\`${comando.name}\``);
        } catch (err) {
          console.warn(`[Help] Erro ao carregar comando "${file}": ${err.message}`);
          continue;
        }
      }

      if (comandos.length > 0) {
        embed.addFields({
          name: `📂 ${capitalize(categoria)}`,
          value: comandos.join(', '),
          inline: false
        });
      }
    }

    return message.channel.send({ embeds: [embed] });
  }
};

/**
 * Capitaliza a primeira letra de uma string.
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
