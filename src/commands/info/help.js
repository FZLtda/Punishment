'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { EmbedBuilder } = require('discord.js');
const { colors } = require('@config');
const { formatUsage } = require('@utils/formatUsage');
const { getPrefix } = require('@utils/prefixManager');

module.exports = {
  name: 'help',
  description: 'Exibe todos os comandos disponíveis ou detalhes de um comando específico.',
  usage: '${currentPrefix}help [comando]',
  deleteMessage: true,

  async execute(message, args) {
    const client = message.client;
    const prefix = await getPrefix(message.guild?.id);
    const input = args[0]?.toLowerCase();

    // Detalhes de um comando específico
    if (input) {
      const command =
        client.commands.get(input) ||
        client.commands.find(cmd => cmd.aliases?.includes(input));

      if (!command) {
        const erro = new EmbedBuilder()
          .setColor(colors.red)
          .setAuthor({ name: `Comando "${input}" não encontrado.`, iconURL: 'https://bit.ly/42jnCEX' })
          .setTimestamp();

        return message.channel.send({ embeds: [erro] });
      }

      const usage = formatUsage(command.usage || 'Uso não especificado.', prefix);

      const embed = new EmbedBuilder()
        .setColor(colors.green)
        .setTitle(`📖 Comando: ${command.name}`)
        .setDescription(`Abaixo estão os detalhes completos para o comando \`${command.name}\`.`)
        .addFields(
          { name: 'Descrição', value: command.description || 'Sem descrição.', inline: false },
          { name: 'Uso', value: `\`${usage}\``, inline: false },
          {
            name: 'Permissões',
            value: `👤 Usuário: ${command.userPermissions?.join(', ') || 'Nenhuma'}\n🤖 Bot: ${command.botPermissions?.join(', ') || 'Nenhuma'}`,
            inline: false
          }
        )
        .setFooter({ text: `Requisitado por ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    }

    // Ajuda geral com todas as categorias
    const categoriasPath = path.join(__dirname, '..');
    const categorias = fs.readdirSync(categoriasPath).filter(folder => {
      const fullPath = path.join(categoriasPath, folder);
      return fs.existsSync(fullPath) && fs.lstatSync(fullPath).isDirectory();
    });

    const embed = new EmbedBuilder()
      .setColor(colors.blue)
      .setTitle('📚 Central de Comandos')
      .setDescription(`Use \`${prefix}help <comando>\` para obter detalhes sobre um comando específico.`)
      .setTimestamp()
      .setFooter({ text: `Requisitado por ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

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
          console.warn(`[Help] Falha ao carregar "${file}": ${err.message}`);
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
