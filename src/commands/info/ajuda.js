const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'ajuda',
  description: 'Exibe informações detalhadas sobre os comandos.',
  usage: '${currentPrefix}help [comando]',
  userPermissions: ['SendMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,
  
  execute: async (message, args, { getPrefix }) => {
    const commands = message.client.commands;

    if (!commands || commands.size === 0) {
      const embedErroMinimo = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Parece que os comandos não foram carregados.',
          iconURL: emojis.icon_attention,
        });

      return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    const currentPrefix = typeof getPrefix === 'function' ? getPrefix(message.guild.id) : '.';
    if (args.length > 0) {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName);

      if (!command) {
        const embedErroMinimo = new EmbedBuilder()
          .setColor(colors.yellow)
          .setAuthor({
            name: 'Não encontrei esse comando no sistema.',
            iconURL: emojis.icon_attention,

          });

        return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
      }

      const usage = command.usage?.replace('${currentPrefix}', currentPrefix) || 'Não especificado.';

      const embed = new EmbedBuilder()
        .setColor(colors.red)
        .setTitle(`<:1000042965:1336131844718202942> ${command.name}`)
        .setDescription(command.description || '`Nenhuma descrição disponível.`')
        .addFields(
          { name: '<:1000043157:1336324220770062497> Uso', value: `\`${usage}\``, inline: false },
          { name: '<:1000042960:1336120845881442365> Permissões Necessárias', value: `\`${command.userPermissions || 'Nenhuma'}\``, inline: false }
        )
        .setFooter({
          text: 'Punishment',
          iconURL: message.client.user.displayAvatarURL(),
        });

      return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }

    const embed = new EmbedBuilder()
      .setColor(red)
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
          value: `Use \`${currentPrefix}help <comando>\` para exibir mais informações sobre um comando.`,
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

    return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
  },
};
