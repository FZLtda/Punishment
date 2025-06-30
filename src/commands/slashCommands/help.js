const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Exibe informações detalhadas sobre os comandos.')
    .addStringOption(option =>
      option
        .setName('comando')
        .setDescription('Nome do comando para obter informações.')
        .setRequired(false)
    ),

  async execute(interaction) {
    const commands = interaction.client.slashCommands;

    if (!commands || commands.size === 0) {
      const embedErro = new EmbedBuilder()
        .setColor(colors.warning)
        .setAuthor({
          name: 'Nenhum comando encontrado.',
          iconURL: emojis.attention || null
        });

      return interaction.reply({ embeds: [embedErro], ephemeral: true });
    }

    const commandName = interaction.options.getString('comando');

    if (commandName) {
      const command = commands.get(commandName.toLowerCase());

      if (!command) {
        const embedErro = new EmbedBuilder()
          .setColor(colors.warning)
          .setAuthor({
            name: 'Esse comando não existe.',
            iconURL: emojis.attention || null
          });

        return interaction.reply({ embeds: [embedErro], ephemeral: true });
      }

      const embedDetalhes = new EmbedBuilder()
        .setColor(colors.primary)
        .setTitle(`${emojis.info || ''} Comando: /${command.data.name}`)
        .setDescription(command.data.description || 'Nenhuma descrição disponível.')
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

    const embedLista = new EmbedBuilder()
      .setColor(colors.primary)
      .setTitle(`${emojis.info || ''} Comandos disponíveis`)
      .setDescription('Use `/help <comando>` para detalhes.')
      .addFields(
        ...commands.map(cmd => ({
          name: `/${cmd.data.name}`,
          value: cmd.data.description || '`Sem descrição.`',
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
