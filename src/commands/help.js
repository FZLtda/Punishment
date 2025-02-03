const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Mostra informações sobre os comandos.',
  usage: '.help [comando]',
  execute: async (message, args) => {
    const commands = message.client.commands;

    
    if (args.length > 0) {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName);

      if (!command) {
        return message.reply({
          content: '<:1000042883:1336044555354771638> Não encontrei esse comando no sistema.',
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle(`Informações sobre o comando: \`${command.name}\``)
        .setDescription(command.description || 'Nenhuma descrição disponível.')
        .addFields(
          { name: 'Uso', value: command.usage || 'Não especificado.' },
          { name: 'Permissões Necessárias', value: command.permissions || 'Nenhuma' }
        )
        .setFooter({
          text: 'Punishment',
          iconURL: message.client.user.displayAvatarURL(),
        });

      return message.reply({ embeds: [embed] });
    }

   
    const embed = new EmbedBuilder()
      .setColor(0x00aaff)
      .setTitle('<:1000042770:1335945568136069233> Comandos Principais')
      .addFields(
        { name: 'help', value: '`Mostra a lista completa de comandos ou informações detalhadas sobre um comando.`', inline: true },
        { name: 'ping', value: '`Exibe os detalhes da conexão do bot.`', inline: true },
        { name: 'privacy', value: '`Exibe a política de privacidade.`', inline: true },
        { name: 'shard', value: '`Informações sobre o shard.`', inline: true },
        { name: 'stats', value: '`Mostra as estatísticas do bot.`', inline: true },
        { name: 'undo', value: '`Desfaz o último comando executado.`', inline: true }
      )
      .addFields(
        {
          name: '<:1000042773:1335945498212696085> Ajuda',
          value: 'Use `.help <comando>` para obter mais informações sobre um comando específico.',
        },
        {
          name: '<:1000042771:1335945525601505351> Suporte',
          value: 'Precisa de mais ajuda? [Clique aqui](https://discord.gg/exemplo)',
        }
      )
      .setFooter({
        text: 'Punishment',
        iconURL: message.client.user.displayAvatarURL(),
      });

    return message.reply({ embeds: [embed] });
  },
};
