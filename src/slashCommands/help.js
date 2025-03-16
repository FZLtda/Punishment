const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Exibe informações detalhadas sobre os comandos.')
    .addStringOption(option =>
      option
        .setName('comando')
        .setDescription('Nome do comando para obter informações detalhadas')
        .setRequired(false)
    ),

  async execute(interaction) {
    const commands = interaction.client.commands;

    if (!commands || commands.size === 0) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Parece que os comandos não foram carregados.',
          iconURL: 'http://bit.ly/4aIyY9j',
        });

      return interaction.reply({ embeds: [embedErro], ephemeral: true });
    }

    const commandName = interaction.options.getString('comando');

    if (commandName) {
      let command = commands.find(cmd => cmd.data.name.toLowerCase() === commandName.toLowerCase());

      if (!command) {
        const embedErro = new EmbedBuilder()
          .setColor('#FF4C4C')
          .setAuthor({
            name: 'Não encontrei esse comando no sistema.',
            iconURL: 'http://bit.ly/4aIyY9j',
          });

        return interaction.reply({ embeds: [embedErro], ephemeral: true });
      }

      const usage = command.usage ? `\`${command.usage}\`` : '`Não especificado.`';
      const permissions = command.permissions ? `\`${command.permissions}\`` : '`Nenhuma`';

      const embed = new EmbedBuilder()
        .setColor(0x36393F)
        .setTitle(`<:1000042965:1336131844718202942> ${command.data.name}`)
        .setDescription(command.data.description || '`Nenhuma descrição disponível.`')
        .addFields(
          { name: '<:1000043157:1336324220770062497> Uso', value: usage, inline: false },
          { name: '<:1000042960:1336120845881442365> Permissões Necessárias', value: permissions, inline: false }
        )
        .setFooter({
          text: 'Punishment',
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0x36393F)
      .setTitle('<:1000043167:1336329540502421576> Comandos Principais')
      .addFields(
        { name: 'help', value: '`Exibe informações detalhadas sobre os comandos.`', inline: true },
        { name: 'ping', value: '`Exibe os detalhes da conexão do bot.`', inline: true },
        { name: 'privacy', value: '`Exibe a política de privacidade.`', inline: true },
        { name: 'mod-stats', value: '`Exibe estatísticas da moderação no servidor.`', inline: true },
        { name: 'stats', value: '`Exibe as estatísticas do bot.`', inline: true },
        { name: 'undo', value: '`Desfaz o último comando executado.`', inline: true }
      )
      .addFields(
        {
          name: '<:1000043159:1336324177900077076> Ajuda',
          value: `Use \`/help <comando>\` para exibir mais informações sobre um comando.`,
        },
        {
          name: '<:1000043160:1336324162482081945> Suporte',
          value: '[Visite nossa comunidade](https://discord.gg/SW4zKzAhQa)',
        }
      )
      .setFooter({
        text: 'Punishment',
        iconURL: interaction.client.user.displayAvatarURL(),
      });

    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
