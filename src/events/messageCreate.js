'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');
const { getPrefix } = require('@utils/prefixManager');
const Logger = require('@logger');

module.exports = {
  name: 'messageCreate',

  /**
   * Manipulador do evento messageCreate
   * @param {import('discord.js').Message} message
   */
  async execute(message) {
    if (!message.guild || message.author.bot) return;

    // Prefixo customizado por servidor
    const prefix = message.client.getPrefix
      ? await message.client.getPrefix(message.guild.id)
      : await getPrefix(message.guild.id);

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift()?.toLowerCase();
    const command = message.client.commands.get(cmdName);
    if (!command) return;

    // Verificação de permissões do usuário
    const member = await message.guild.members.fetch(message.author.id);
    if (command.userPermissions && !member.permissions.has(command.userPermissions)) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(colors.red)
            .setAuthor({
              name: 'Você não tem permissão para usar este comando.',
              iconURL: emojis.attention || null
            })
        ],
        allowedMentions: { repliedUser: false }
      });
    }

    // Verificação de permissões do bot
    const botMember = message.guild.members.me;
    if (command.botPermissions && !botMember.permissions.has(command.botPermissions)) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(colors.yellow)
            .setAuthor({
              name: 'Eu não tenho permissão suficiente para executar este comando.',
              iconURL: emojis.attention || null
            })
        ],
        allowedMentions: { repliedUser: false }
      });
    }

    // Opcional: deletar mensagem do usuário
    if (command.deleteMessage) {
      try {
        await message.delete();
      } catch (err) {
        Logger.warn(`Não foi possível deletar a mensagem de ${message.author.tag}: ${err.message}`);
      }
    }

    // Execução do comando
    try {
      await command.execute(message, args);
    } catch (error) {
      Logger.error(`Erro ao executar o comando "${command.name}" em ${message.guild.name}: ${error.stack || error}`);

      const errorEmbed = new EmbedBuilder()
        .setColor(colors.yellow)
        .setTitle('Erro inesperado')
        .setDescription('Ocorreu um erro durante a execução deste comando.')
        .setFooter({
          text: 'Punishment • messageCreate',
          iconURL: message.client.user.displayAvatarURL()
        })
        .setTimestamp();

      return message.channel.send({
        embeds: [errorEmbed],
        allowedMentions: { repliedUser: false }
      });
    }
  }
};
