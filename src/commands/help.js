const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Mostra informações sobre os comandos disponíveis ou detalhes de um comando específico.',
  usage: '.help [comando]',
  permissions: 'Nenhuma',
  execute: async (message, args) => {
    const commands = message.client.commands;

    
    if (!commands || commands.size === 0) {
      return message.reply({
        content: '⚠️ Os comandos não foram carregados corretamente. Verifique a configuração do bot.',
        ephemeral: true,
      });
    }

   
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
        .setTitle(<:1000042962:1336123387164098631> `${command.name}`)
        .setDescription(command.description || 'Nenhuma descrição disponível.')
        .addFields(
          { name: '<:1000042957:1336119362683408384> Uso', value: command.usage || 'Não especificado.', inline: false },
          { name: '<:1000042960:1336120845881442365> Permissões Necessárias', value: command.permissions || 'Nenhuma', inline: false }
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
      .setDescription('Veja abaixo a lista de comandos disponíveis. Use `.help <comando>` para obter mais detalhes sobre um comando específico.')
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
