'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { Collection } = require('discord.js');
const { colors } = require('@config');
const { getPrefix } = require('@utils/getPrefix');
const { formatUsage } = require('@utils/formatUsage');
const { embedAviso, embedErro } = require('@utils/embeds');
const { client } = require('@root');

module.exports = {
  name: 'help',
  description: 'Mostra todos os comandos disponíveis ou informações de um comando específico.',
  usage: '${currentPrefix}help [comando]',
  deleteMessage: true,

  async execute(message, args) {
    const prefix = await getPrefix(message.guild?.id);
    const comandoNome = args[0]?.toLowerCase();

    // Detalhes de um comando específico
    if (comandoNome) {
      const comando =
        client.commands.get(comandoNome) ||
        client.commands.find(cmd => cmd.aliases?.includes(comandoNome));

      if (!comando) {
        return message.channel.send({
          embeds: [
            embedErro({ descricao: `O comando \`${comandoNome}\` não foi encontrado.` })
          ]
        });
      }

      const usage = formatUsage(comando.usage || 'Sem uso especificado.', prefix);
      const embed = embedAviso({
        descricao: `Informações sobre o comando \`${comando.name}\`:`,
        campos: [
          { name: 'Descrição', value: comando.description || 'Sem descrição.', inline: false },
          { name: 'Uso', value: `\`${usage}\``, inline: false },
          {
            name: 'Permissões',
            value: `Usuário: ${comando.userPermissions?.join(', ') || 'Nenhuma'}\nBot: ${comando.botPermissions?.join(', ') || 'Nenhuma'}`,
            inline: false
          }
        ]
      });

      return message.channel.send({ embeds: [embed] });
    }

    // Mostrar todos os comandos organizados por categoria
    const categoriasPath = path.join(__dirname, '..');
    const categorias = fs.readdirSync(categoriasPath);

    const embed = embedAviso({
      descricao: `Use \`${prefix}help <comando>\` para ver mais detalhes sobre um comando específico.`,
      campos: [],
    });

    for (const categoria of categorias) {
      const comandos = [];

      const categoriaPath = path.join(categoriasPath, categoria);
      if (!fs.lstatSync(categoriaPath).isDirectory()) continue;

      const arquivos = fs.readdirSync(categoriaPath).filter(file => file.endsWith('.js'));
      for (const file of arquivos) {
        const comando = require(path.join(categoriaPath, file));
        if (!comando?.name || comando.private) continue;
        comandos.push(`\`${comando.name}\``);
      }

      if (comandos.length > 0) {
        embed.data.fields.push({
          name: categoria.charAt(0).toUpperCase() + categoria.slice(1),
          value: comandos.join(', '),
          inline: false
        });
      }
    }

    return message.channel.send({ embeds: [embed] });
  }
};
