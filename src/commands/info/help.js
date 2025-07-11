'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');
const { formatUsage } = require('@utils/formatUsage');
const { getPrefix } = require('@utils/prefixManager');
const { sendEmbed } = require('@utils/embedReply');

module.exports = {
  name: 'help',
  description: 'Exibe todos os comandos disponíveis ou detalhes de um comando específico.',
  usage: '${currentPrefix}help [comando]',
  deleteMessage: true,

  async execute(message, args) {
    const client = message.client;
    const prefix = await getPrefix(message.guild?.id);
    const input = args[0]?.toLowerCase();

    // Ajuda de um comando específico
    if (input) {
      const command =
        client.commands.get(input) ||
        client.commands.find(cmd => cmd.aliases?.includes(input));

      if (!command) {
        return sendEmbed('yellow', message, `Não foi possível encontrar este comando.`);
      }

      const usage = formatUsage(command.usage || 'Uso não especificado.', prefix);

      const embed = new EmbedBuilder()
        .setColor(colors.red)
        .setTitle(`${emojis.search} Comando: ${command.name}`)
        .setDescription('Abaixo estão os detalhes do comando.')
        .addFields(
          { name: 'Descrição', value: command.description || 'Sem descrição.', inline: false },
          { name: 'Uso', value: `\`${usage}\``, inline: false },
          {
            name: 'Permissões',
            value: `-# ${emojis.user} Usuário: ${command.userPermissions?.join(', ') || 'Nenhuma'}\n-# ${emojis.bot} Bot: ${command.botPermissions?.join(', ') || 'Nenhuma'}`,
            inline: false
          }
        )
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    }

    // Ajuda geral com categorias ordenadas
    const categoriasPath = path.join(__dirname, '..');

    const ordemCategorias = ['admin', 'mod', 'info', 'util', 'giveaway'];
    const categorias = ordemCategorias.filter(cat => {
      const fullPath = path.join(categoriasPath, cat);
      return fs.existsSync(fullPath) && fs.lstatSync(fullPath).isDirectory();
    });

    const embed = new EmbedBuilder()
      .setColor(colors.red)
      .setTitle(`${emojis.home} Central de Comandos`)
      .setDescription(`Use \`${prefix}help <comando>\` para obter detalhes sobre um comando específico.`)
      .setFooter({
        text: `${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    for (const categoria of categorias) {
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
          name: `${formatCategoria(categoria)}`,
          value: comandos.join(', '),
          inline: false
        });
      }
    }

    return message.channel.send({ embeds: [embed] });
  }
};

/**
 * Capitaliza e formata nomes de categoria.
 */
function formatCategoria(str) {
  const map = {
    admin:    `${emojis.adm} Adm`,
    mod:      `${emojis.mod} Mod`,
    info:     `${emojis.info} Info`,
    util:     `${emojis.util} Util`,
    giveaway: `${emojis.give} Giveaway`
  };
  return map[str] || str.charAt(0).toUpperCase() + str.slice(1);
}
