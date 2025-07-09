'use strict';

const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { colors } = require('@config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Exibe todos os comandos disponíveis ou detalhes de um comando específico.')
    .addStringOption(option =>
      option.setName('comando')
        .setDescription('Nome do comando para obter detalhes específicos')
        .setRequired(false)
    ),

  async execute(interaction) {
    const client = interaction.client;
    const input = interaction.options.getString('comando')?.toLowerCase();

    // Detalhes de um comando específico
    if (input) {
      const command =
        client.slashCommands.get(input) ||
        client.commands?.get(input) ||
        client.commands?.find(cmd => cmd.aliases?.includes(input));

      if (!command) {
        const erro = new EmbedBuilder()
          .setColor(colors.red)
          .setAuthor({
            name: `Comando "${input}" não encontrado.`,
            iconURL: 'https://bit.ly/42jnCEX'
          });

        return interaction.reply({ embeds: [erro], ephemeral: true });
      }

      const usage = command.usage?.replace('${currentPrefix}', '/') || `/${command.data.name}`;

      const embed = new EmbedBuilder()
        .setColor(colors.red)
        .setTitle(`📖 Comando: ${command.data?.name || command.name}`)
        .setDescription(`Abaixo estão os detalhes completos para o comando \`${command.data?.name || command.name}\`.`)
        .addFields(
          { name: 'Descrição', value: command.description || 'Sem descrição.', inline: false },
          { name: 'Uso', value: `\`${usage}\``, inline: false },
          {
            name: 'Permissões',
            value: `👤 Usuário: ${command.userPermissions?.join(', ') || 'Nenhuma'}\n🤖 Bot: ${command.botPermissions?.join(', ') || 'Nenhuma'}`,
            inline: false
          }
        )
        .setFooter({
          text: `${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Ajuda geral
    const categoriasPath = path.join(__dirname, '../../commands');
    const categorias = fs.readdirSync(categoriasPath).filter(folder => {
      const fullPath = path.join(categoriasPath, folder);
      return fs.existsSync(fullPath) && fs.lstatSync(fullPath).isDirectory();
    });

    const embed = new EmbedBuilder()
      .setColor(colors.red)
      .setTitle('📚 Central de Comandos')
      .setDescription(`Use \`/help <comando>\` para obter detalhes sobre um comando específico.`)
      .setTimestamp()
      .setFooter({
        text: `${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      });

    for (const categoria of categorias.sort()) {
      const comandos = [];

      const categoriaPath = path.join(categoriasPath, categoria);
      const arquivos = fs.readdirSync(categoriaPath).filter(file => file.endsWith('.js'));

      for (const file of arquivos.sort()) {
        try {
          const comando = require(path.join(categoriaPath, file));
          if (!comando?.data?.name || comando.private) continue;
          comandos.push(`\`/${comando.data.name}\``);
        } catch (err) {
          console.warn(`[Slash Help] Falha ao carregar "${file}": ${err.message}`);
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

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
