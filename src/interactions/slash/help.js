const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Exibe informações detalhadas sobre os comandos disponíveis.')
    .addStringOption(option =>
      option
        .setName('comando')
        .setDescription('Nome exato de um comando para obter informações.')
        .setRequired(false)
    ),

  async execute(interaction) {
    const commands = interaction.client.slashCommands;

    if (!commands || commands.size === 0) {
      const embedErro = new EmbedBuilder()
        .setColor(colors.warning)
        .setAuthor({
          name: 'Nenhum comando foi carregado no sistema.',
          iconURL: emojis.icon_attention || null
        });

      return interaction.reply({ embeds: [embedErro], ephemeral: true });
    }

    const nomeComando = interaction.options.getString('comando');

    // Caso o usuário tenha informado um comando específico
    if (nomeComando) {
      const command = commands.get(nomeComando.toLowerCase());

      if (!command) {
        const embedErro = new EmbedBuilder()
          .setColor(colors.warning)
          .setAuthor({
            name: 'Comando não encontrado no sistema.',
            iconURL: emojis.icon_attention || null
          });

        return interaction.reply({ embeds: [embedErro], ephemeral: true });
      }

      const embedDetalhes = new EmbedBuilder()
        .setColor(colors.primary)
        .setTitle(`${emojis.info || 'ℹ️'} Detalhes do Comando: /${command.data.name}`)
        .setDescription(command.data.description || 'Sem descrição disponível.')
        .addFields(
          {
            name: `${emojis.arrow || '➡️'} Uso`,
            value: `\`/${command.data.name}\``,
            inline: true
          }
        )
        .setFooter({
          text: 'Punishment',
          iconURL: interaction.client.user.displayAvatarURL()
        });

      return interaction.reply({ embeds: [embedDetalhes], ephemeral: true });
    }

    // Lista de comandos disponíveis
    const embedLista = new EmbedBuilder()
      .setColor(colors.primary)
      .setTitle(`${emojis.info || 'ℹ️'} Lista de Comandos`)
      .setDescription('Use `/help <comando>` para ver detalhes individuais.')
      .addFields(
        ...[...commands.values()].map(cmd => ({
          name: `/${cmd.data.name}`,
          value: cmd.data.description || 'Sem descrição.',
          inline: true
        }))
      )
      .setFooter({
        text: 'Punishment',
        iconURL: interaction.client.user.displayAvatarURL()
      });

    return interaction.reply({ embeds: [embedLista], ephemeral: true });
  }
};
