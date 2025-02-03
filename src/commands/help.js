const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Mostra informações sobre os comandos.',
  execute: async (message) => {
    const embed = new EmbedBuilder()
      .setColor(0x00aaff)
      .setTitle('<:1000042770:1335945568136069233> Comandos Principais')
      .addFields(
        { name: 'help', value: 'Mostra a lista completa de comandos ou informações detalhadas sobre um comando.', inline: true },
        { name: 'ping', value: 'Exibe os detalhes da conexão do bot.', inline: true },
        { name: 'privacy', value: 'Exibe a política de privacidade.', inline: true },
        { name: 'shard', value: 'Informações sobre o shard.', inline: true },
        { name: 'stats', value: 'Mostra as estatísticas do bot.', inline: true },
        { name: 'undo', value: 'Desfaz o último comando executado.', inline: true }
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