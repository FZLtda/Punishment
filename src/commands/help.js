const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Exibe informações detalhadas sobre os comandos.',
  usage: '`.help [comando]`',
  permissions: '`Nenhuma`',
  execute: async (message, args) => {
    const commands = message.client.commands;

    if (!commands || commands.size === 0) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Parece que os comandos não foram carregados.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
    }

    if (args.length > 0) {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName);

      if (!command) {
        const embedErroMinimo = new EmbedBuilder()
            .setColor('#FF4C4C')
            .setAuthor({
                name: 'Não encontrei esse comando no sistema.',
                iconURL: 'http://bit.ly/4aIyY9j'
            });
      
        return message.reply({ embeds: [embedErroMinimo] });
      }

      const embed = new EmbedBuilder()
        .setColor(0x36393F)
        .setTitle(`<:1000042965:1336131844718202942> ${command.name}`)
        .setDescription(command.description || '`Nenhuma descrição disponível.`')
        .addFields(
          { name: '<:1000043157:1336324220770062497> Uso', value: `\`${command.usage || 'Não especificado.'}\``, inline: false },
          { name: '<:1000042960:1336120845881442365> Permissões Necessárias', value: `\`${command.permissions || 'Nenhuma'}\``, inline: false }
        )
        .setFooter({
          text: 'Punishment',
          iconURL: message.client.user.displayAvatarURL(),
        });

      return message.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor(0x36393F)
      .setTitle('<:1000043167:1336329540502421576> Comandos Principais')
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
          name: '<:1000043159:1336324177900077076> Ajuda',
          value: 'Use `.help <comando>` para exibir mais informações sobre um comando.',
        },
        {
          name: '<:1000043160:1336324162482081945> Suporte',
          value: '[Visite nossa comunidade](https://discord.gg/SW4zKzAhQa)',
        }
      )
      .setFooter({
        text: 'Punishment',
        iconURL: message.client.user.displayAvatarURL(),
      });

    return message.reply({ embeds: [embed] });
  },
};
