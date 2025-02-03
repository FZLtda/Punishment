const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Mostra informações sobre o bot e seus comandos.')
    .addStringOption(option =>
      option
        .setName('comando')
        .setDescription('Nome do comando para obter informações detalhadas.')
        .setRequired(false)
    ),
  async execute(interaction) {
    const client = interaction.client;
    const commands = client.commands;
    const commandName = interaction.options.getString('comando');

    if (commandName) {
      const command = commands.get(commandName);

      if (!command) {
        return interaction.reply({
          content: `<:no:1122370713932795997> Comando \`${commandName}\` não encontrado.`,
          ephemeral: true,
        });
      }

      const commandEmbed = new EmbedBuilder()
        .setColor('#fe3838')
        .setTitle(`<:emoji_45:1323360352498618398> Informações do Comando: \`${command.name}\``)
        .addFields(
          { name: 'Descrição', value: command.description || 'Nenhuma descrição disponível.', inline: false },
          { name: 'Uso', value: command.usage || 'Sem informações de uso.', inline: false }
        )
        .setFooter({
          text: `Solicitado por ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return interaction.reply({ embeds: [commandEmbed] });
    }

    const botAvatar = client.user?.displayAvatarURL({ dynamic: true }) || null;

    const helpEmbed = new EmbedBuilder()
      .setColor('#fe3838')
      .setTitle('<:emoji_45:1323360352498618398> Bem-vindo ao Punishment!')
      .setDescription(
        `Olá, **${interaction.user.displayName}**! Aqui estão algumas informações importantes para você começar.`
      )
      .addFields(
        {
          name: 'Prefixo Padrão:',
          value: '.',
          inline: true,
        },
        {
          name: 'Como usar:',
          value: `Para obter informações detalhadas de um comando, use \`/help [comando]\`.`,
          inline: true,
        },
        {
          name: 'Exemplos de Uso:',
          value: `/help ping - Mostra informações sobre o comando \`ping\`.\n/help uptime - Mostra informações sobre o comando \`uptime\`.\n/help ban - Mostra informações sobre o comando \`ban\`.`,
          inline: false,
        },
        {
          name: 'Sobre o Bot:',
          value: `Eu sou o Punishment, um bot de moderação criado para tornar sua experiência no Discord mais segura e organizada.`,
          inline: false,
        }
      )
      .setFooter({
        text: `${interaction.user.tag} | Punishment`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setThumbnail(botAvatar)
      .setTimestamp();

    await interaction.reply({ embeds: [helpEmbed] });
  },
};
