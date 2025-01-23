const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Exibe a lista de comandos disponíveis ou informações detalhadas de um comando.')
    .addStringOption((option) =>
      option
        .setName('comando')
        .setDescription('Nome do comando para obter mais informações.')
        .setRequired(false)
    ),
  async execute(interaction) {
    const { slashCommands, commands } = interaction.client;

    const commandName = interaction.options.getString('comando');

    if (commandName) {
      const slashCommand = slashCommands.get(commandName.toLowerCase());
      const prefixCommand = commands.get(commandName.toLowerCase());

      if (!slashCommand && !prefixCommand) {
        return interaction.reply({
          content: `<:no:1122370713932795997> Comando \`${commandName}\` não encontrado.`,
          ephemeral: true,
        });
      }

      const commandEmbed = new EmbedBuilder()
        .setColor('#0077FF')
        .setTitle(`📘 Informações do Comando: ${slashCommand ? `/${slashCommand.data.name}` : `${prefixCommand.name}`}`)
        .addFields(
          { name: 'Descrição', value: slashCommand?.data.description || prefixCommand?.description || 'Nenhuma descrição disponível.', inline: false },
          {
            name: 'Uso',
            value: prefixCommand ? `\`${prefixCommand.name} ${prefixCommand.usage || ''}\`` : 'Comando Slash: Use diretamente no Discord.',
            inline: false,
          }
        )
        .setFooter({
          text: `Requisitado por ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return interaction.reply({ embeds: [commandEmbed], ephemeral: true });
    }

    const helpEmbed = new EmbedBuilder()
      .setColor('#0077FF')
      .setTitle('<:emoji_45:1323360352498618398> Lista de Comandos')
      .setDescription(
        'Aqui está uma lista de todos os comandos disponíveis no bot. Use `/help [comando]` para obter informações detalhadas de um comando específico.'
      )
      .setFooter({
        text: `Requisitado por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    if (commands.size > 0) {
      helpEmbed.addFields({
        name: 'Comandos por Prefixo',
        value: commands.map((cmd) => `\`${cmd.name}\``).join(', ') || 'Nenhum comando disponível.',
        inline: false,
      });
    }

    if (slashCommands.size > 0) {
      helpEmbed.addFields({
        name: 'Comandos Slash',
        value: slashCommands.map((cmd) => `\`/${cmd.data.name}\``).join(', ') || 'Nenhum comando disponível.',
        inline: false,
      });
    }

    await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
  },
};