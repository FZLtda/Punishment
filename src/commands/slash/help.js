'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const checkGlobalBan = require('@middlewares/checkGlobalBan');
const { formatUsage } = require('@utils/formatUsage');
const { getPrefix } = require('@utils/prefixManager');
const { sendEmbed } = require('@utils/embedReply');
const { colors, emojis } = require('@config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Exibe todos os comandos disponíveis ou detalhes de um comando específico.')
    .addStringOption(option =>
      option.setName('comando')
        .setDescription('Nome do comando para ver detalhes.')
        .setRequired(false)
    ),

  async execute(interaction) {
    const isBanned = await checkGlobalBan(message);
    if (isBanned) return;
    
     const client = interaction.client;
     const prefix = await getPrefix(interaction.guild?.id);
     const input = interaction.options.getString('comando')?.toLowerCase();

    // Ajuda para um comando específico
    if (input) {
      const command =
        client.slashCommands.get(input) ||
        client.commands.get(input) ||
        client.commands.find(cmd => cmd.aliases?.includes(input));

      if (!command)
        return sendEmbed('yellow', interaction, 'Não foi possível encontrar este comando.');

      const usage = formatUsage(command.usage || 'Uso não especificado.', prefix);

      const detailEmbed = new EmbedBuilder()
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
          text: interaction.user.username,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      return interaction.reply({ embeds: [detailEmbed], flags: 1 << 6 });
    }

    // Ajuda geral com categorias organizadas
    const categoriasPath = path.join(__dirname, '..');
    const ordemCategorias = ['admin', 'mod', 'info', 'util', 'giveaway'];

    const categorias = ordemCategorias.filter(cat => {
      const fullPath = path.join(categoriasPath, cat);
      return fs.existsSync(fullPath) && fs.lstatSync(fullPath).isDirectory();
    });

    const embed = new EmbedBuilder()
      .setColor(colors.red)
      .setTitle(`${emojis.home} Central de Comandos`)
      .setDescription(`Use \`/help <comando>\` para obter detalhes sobre um comando específico.`)
      .setFooter({
        text: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    for (const categoria of categorias) {
      const comandos = [];
      const categoriaPath = path.join(categoriasPath, categoria);
      const arquivos = fs.readdirSync(categoriaPath).filter(file => file.endsWith('.js'));

      for (const file of arquivos.sort()) {
        try {
          const comando = require(path.join(categoriaPath, file));
          if (comando.private) continue;

          const nome = comando.data?.name || comando.name;
          if (!nome) continue;

          comandos.push(`\`${nome}\``);
        } catch (err) {
          console.warn(`[Help] Falha ao carregar "${file}": ${err.message}`);
        }
      }

      if (comandos.length > 0) {
        embed.addFields({
          name: formatCategoria(categoria),
          value: comandos.join(', '),
          inline: false
        });
      }
    }

    return interaction.reply({ embeds: [embed], flags: 1 << 6 });
  }
};

/**
 * Capitaliza e formata nomes de categoria com emoji.
 * @param {string} str
 * @returns {string}
 */
function formatCategoria(str) {
  const map = {
    admin: `${emojis.adm} Adm`,
    mod: `${emojis.mod} Mod`,
    info: `${emojis.info} Info`,
    util: `${emojis.util} Util`,
    giveaway: `${emojis.give} Giveaway`
  };
  return map[str] || str.charAt(0).toUpperCase() + str.slice(1);
}
