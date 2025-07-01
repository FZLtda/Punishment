const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');
const { admin, mod } = require('@config/roles');

module.exports = {
  name: 'messageCreate',

  async execute(message) {
    // Ignora mensagens de bot ou fora de guild
    if (!message.guild || message.author.bot) return;

    const prefix = message.client.getPrefix
      ? await message.client.getPrefix(message.guild.id)
      : process.env.DEFAULT_PREFIX;

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift()?.toLowerCase();
    const command = message.client.commands.get(cmdName);

    if (!command) return;

    // Verifica permissões do usuário
    const member = await message.guild.members.fetch(message.author.id);
    if (command.userPermissions && !member.permissions.has(command.userPermissions)) {
      return message.channel.send({
        embeds: [new EmbedBuilder()
          .setColor(colors.warning)
          .setAuthor({
            name: 'Você não tem permissão para usar este comando.',
            iconURL: emojis.attention
          })],
        allowedMentions: { repliedUser: false }
      });
    }

    // Verifica permissões do bot
    const botMember = message.guild.members.me;
    if (command.botPermissions && !botMember.permissions.has(command.botPermissions)) {
      return message.channel.send({
        embeds: [new EmbedBuilder()
          .setColor(colors.warning)
          .setAuthor({
            name: 'Eu não tenho permissão suficiente para executar este comando.',
            iconURL: emojis.attention
          })],
        allowedMentions: { repliedUser: false }
      });
    }

    // Deleta mensagem do autor se opção estiver habilitada
    if (command.deleteMessage) {
      try {
        await message.delete();
      } catch (err) {
        console.warn('Não foi possível deletar a mensagem do autor.');
      }
    }

    // Executa o comando
    try {
      await command.execute(message, args);
    } catch (error) {
      console.error(`Erro ao executar ${command.name}:`, error);

      const embedErro = new EmbedBuilder()
        .setColor(colors.red)
        .setTitle(`${emojis.attent} Erro inesperado`)
        .setDescription('Houve uma falha ao executar este comando.')
        .setFooter({ text: 'Punishment • messageCreate', iconURL: message.client.user.displayAvatarURL() });

      return message.channel.send({
        embeds: [embedErro],
        allowedMentions: { repliedUser: false }
      });
    }
  }
};
