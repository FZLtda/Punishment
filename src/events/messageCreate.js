const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');
const { getPrefix } = require('@utils/prefixManager');

module.exports = {
  name: 'messageCreate',

  async execute(message) {
    if (!message.guild || message.author.bot) return;

    const prefix = message.client.getPrefix
      ? await message.client.getPrefix(message.guild.id)
      : await getPrefix(message.guild.id);

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift()?.toLowerCase();
    const command = message.client.commands.get(cmdName);
    if (!command) return;

    const member = await message.guild.members.fetch(message.author.id);
    if (command.userPermissions && !member.permissions.has(command.userPermissions)) {
      return message.channel.send({
        embeds: [new EmbedBuilder()
          .setColor(colors.red)
          .setAuthor({
            name: 'Você não tem permissão para usar este comando.',
            iconURL: emojis.attention || null
          })
        ],
        allowedMentions: { repliedUser: false }
      });
    }

    const botMember = message.guild.members.me;
    if (command.botPermissions && !botMember.permissions.has(command.botPermissions)) {
      return message.channel.send({
        embeds: [new EmbedBuilder()
          .setColor(colors.yellow)
          .setAuthor({
            name: 'Eu não tenho permissão suficiente para executar este comando.',
            iconURL: emojis.attention || null
          })
        ],
        allowedMentions: { repliedUser: false }
      });
    }

    if (command.deleteMessage) {
      try {
        await message.delete();
      } catch (err) {
        console.warn(`[WARN] Não consegui deletar mensagem de ${message.author.tag}`);
      }
    }

    try {
      await command.execute(message, args);
    } catch (error) {
      console.error(`[ERROR] Falha ao executar ${command.name}:`, error);

      const embedErro = new EmbedBuilder()
        .setColor(colors.yellow)
        .setTitle('Erro inesperado')
        .setDescription('Houve uma falha ao executar este comando.')
        .setFooter({
          text: 'Punishment • messageCreate',
          iconURL: message.client.user.displayAvatarURL()
        })
        .setTimestamp();

      return message.channel.send({
        embeds: [embedErro],
        allowedMentions: { repliedUser: false }
      });
    }
  }
};
