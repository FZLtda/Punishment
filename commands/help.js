const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Exibe a lista de comandos disponíveis ou informações detalhadas de um comando.',
  async execute(message, args) {
    const commands = message.client.commands;

    const commandName = args[0]?.toLowerCase();

    if (commandName) {
      const command = commands.get(commandName);

      if (!command) {
        return message.reply(`<:no:1122370713932795997> Comando \`${commandName}\` não encontrado.`);
      }

      const commandEmbed = new EmbedBuilder()
        .setColor('#0077FF')
        .setTitle(`<:emoji_45:1323360352498618398> Informações do Comando: ${command.name}`)
        .addFields(
          { name: 'Descrição', value: command.description || 'Nenhuma descrição disponível.', inline: false }
        )
        .setFooter({
          text: `${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [commandEmbed] });
    }
    
    const helpEmbed = new EmbedBuilder()
      .setColor('#0077FF')
      .setTitle('<:emoji_45:1323360352498618398> Lista de Comandos')
      .setDescription(
        'Aqui está uma lista de todos os comandos disponíveis no bot. Use `.help [comando]` para obter informações detalhadas de um comando específico.'
      )
      .setFooter({
        text: `${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    commands.forEach((cmd) => {
      helpEmbed.addFields({
        name: `${cmd.name}`,
        value: cmd.description || 'Sem descrição disponível.',
        inline: false,
      });
    });

    await message.channel.send({ embeds: [helpEmbed] });
  },
};