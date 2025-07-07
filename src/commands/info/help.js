'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { formatUsage } = require('@utils/formatUsage');
const { embedAviso, embedErro } = require('@utils/embeds');
const { getPrefix } = require('@utils/prefixManager');

module.exports = {
  name: 'help',
  description: 'Exibe todos os comandos ou detalhes sobre um comando específico.',
  usage: '${currentPrefix}help [comando]',
  deleteMessage: true,

  async execute(message, args) {
    const client = message.client;
    const prefix = await getPrefix(message.guild?.id);
    const input = args[0]?.toLowerCase();

    // Informações de um comando específico
    if (input) {
      const command =
        client.commands.get(input) ||
        client.commands.find(cmd => cmd.aliases?.includes(input));

      if (!command) {
        return message.channel.send({
          embeds: [
            embedErro({ descricao: `O comando \`${input}\` não foi encontrado.` })
          ]
        });
      }

      const usage = formatUsage(command.usage || 'Uso não especificado.', prefix);
      const embed = embedAviso({
        descricao: `Informações sobre o comando \`${command.name}\`:`,
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
            value: `Usuário: ${command.userPermissions?.join(', ') || 'Nenhuma'}\nBot: ${command.botPermissions?.join(', ') || 'Nenhuma'}`,
            inline: false
          }
        ]
      });

      return message.channel.send({ embeds: [embed] });
    }

    // Informações gerais
    const categoriasPath = path.join(__dirname, '..');
    const categorias = fs.readdirSync(categoriasPath).filter(folder =>
      fs.lstatSync(path.join(categoriasPath, folder)).isDirectory()
    );

    const embed = embedAviso({
      descricao: `Lista de comandos disponíveis. Use \`${prefix}help <comando>\` para detalhes.`,
    });

    for (const categoria of categorias) {
      const comandos = [];

      const categoriaPath = path.join(categoriasPath, categoria);
      const arquivos = fs.readdirSync(categoriaPath).filter(f => f.endsWith('.js'));

      for (const file of arquivos) {
        try {
          const comando = require(path.join(categoriaPath, file));
          if (!comando?.name || comando.private) continue;
          comandos.push(`\`${comando.name}\``);
        } catch (err) {
          console.warn(`[Help] Erro ao carregar comando ${file}: ${err.message}`);
        }
      }

      if (comandos.length > 0) {
        embed.addFields({
          name: categoria.charAt(0).toUpperCase() + categoria.slice(1),
          value: comandos.join(', '),
          inline: false
        });
      }
    }

    return message.channel.send({ embeds: [embed] });
  }
};
