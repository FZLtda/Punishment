const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Exibe informações sobre o bot e seus comandos.',
  async execute(message, args, client) {
    const commands = message.client.commands;
    const prefix = args[1] || '.';
    const commandName = args[0]?.toLowerCase();

    if (commandName) {
      const command = commands.get(commandName);

      if (!command) {
        return message.reply(`<:no:1122370713932795997> Comando \`${commandName}\` não encontrado.`);
      }

      const commandEmbed = new EmbedBuilder()
        .setColor('#fe3838')
        .setTitle(`<:emoji_45:1323360352498618398> Informações do Comando: \`${command.name}\``)
        .addFields(
          { name: 'Descrição', value: command.description || 'Nenhuma descrição disponível.', inline: false },
          { name: 'Uso', value: command.usage || 'Sem informações de uso.', inline: false }
        )
        .setFooter({
          text: `${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [commandEmbed] });
    }

    const botAvatar = client.user?.displayAvatarURL({ dynamic: true }) || null;

    const helpEmbed = new EmbedBuilder()
      .setColor('#0077FF')
      .setTitle('<:emoji_45:1323360352498618398> Bem-vindo ao Punishment!')
      .setDescription(
        `Olá, **${message.author.displayName}**! Aqui estão algumas informações importantes para você começar.`
      )
      .addFields(
        {
          name: 'Prefixo Atual',
          value: `O meu prefixo neste servidor é: \`${prefix}\``,
          inline: true,
        },
        {
          name: 'Como usar:',
          value: `Para obter informações detalhadas de um comando, digite \`${prefix}help [comando]\` ou \`/help [comando]\`.`,
          inline: true,
        },
        {
          name: 'Exemplos de Uso:',
          value: `\`${prefix}help ping\` - Mostra informações sobre o comando \`ping\`.\n\`${prefix}help uptime\` - Mostra informações sobre o comando \`uptime\`.\n\`${prefix}help ban\` - Mostra informações sobre o comando \`ban\`.`,
          inline: false,
        },
        {
          name: 'Sobre o Bot:',
          value: `Eu sou o Punishment, um bot de moderação criado para tornar sua experiência no Discord mais segura e organizada.`,
          inline: false,
        }
      )
      .setFooter({
        text: `${message.author.tag} | Punishment`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setThumbnail(botAvatar)
      .setTimestamp();

    await message.channel.send({ embeds: [helpEmbed] });
  },
};