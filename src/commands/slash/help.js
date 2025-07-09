'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { EmbedBuilder } = require('discord.js');
const { colors } = require('@config');
const { formatUsage } = require('@utils/formatUsage');
const { getPrefix } = require('@utils/prefixManager');

module.exports = {
  data: {
    name: 'help',
    description: 'Exibe todos os comandos disponíveis ou detalhes de um comando específico.',
    options: [
      {
        name: 'comando',
        type: 3,
        description: 'Nome do comando para ver detalhes',
        required: false
      }
    ]
  },

  async execute(interaction) {
    const client = interaction.client;
    const prefix = await getPrefix(interaction.guild?.id);
    const input = interaction.options.getString('comando')?.toLowerCase();

    // Se especificar um comando
    if (input) {
      const command =
        client.slashCommands.get(input) ||
        client.commands.get(input) ||
        client.commands.find(cmd => cmd.aliases?.includes(input));

      if (!command) {
        const erro = new EmbedBuilder()
          .setColor(colors.red)
          .setAuthor({ name: `Comando "${input}" não encontrado.`, iconURL: 'https://bit.ly/42jnCEX' })
          .setTimestamp();

        return interaction.reply({
          embeds: [erro],
          flags: 1 << 6
        });
      }

      const usage = formatUsage(command.usage || 'Uso não especificado.', prefix);

      const embed = new EmbedBuilder()
        .setColor(colors.red)
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
        .setFooter({ text: `Requisitado por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      return interaction.reply({
        embeds: [embed],
        flags: 1 << 6
      });
    }

    // Ajuda geral
    const categoriasPath = path.join(__dirname, '..');
    const categorias = fs.readdirSync(categoriasPath).filter(folder => {
      const fullPath = path.join(categoriasPath, folder);
      return fs.existsSync(fullPath) && fs.lstatSync(fullPath).isDirectory();
    });

    const embed = new EmbedBuilder()
      .setColor(colors.red)
      .setTitle('📚 Central de Comandos')
      .setDescription(`Use \`${prefix}help <comando>\` para obter detalhes sobre um comando específico.`)
      .setTimestamp()
      .setFooter({ text: `Requisitado por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

    for (const categoria of categorias.sort()) {
      const comandos = [];

      const categoriaPath = path.join(categoriasPath, categoria);
      const arquivos = fs.readdirSync(categoriaPath).filter(file => file.endsWith('.js'));

      for (const file of arquivos.sort()) {
        try {
          const comando = require(path.join(categoriaPath, file));
          if (!comando?.data?.name && !comando?.name) continue;
          if (comando.private) continue;

          const nome = comando.data?.name || comando.name;
          comandos.push(`\`${nome}\``);
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

    return interaction.reply({
      embeds: [embed],
      flags: 1 << 6
    });
  }
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
