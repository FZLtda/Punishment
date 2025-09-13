'use strict';

const { EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { colors, emojis } = require('@config');
const { sendWarning } = require('@embeds/embedWarning');
const { sendModLog } = require('@modules/modlog');
const Logger = require('@logger');

/**
 * Escapa caracteres especiais para uso seguro em regex.
 * @param {string} str
 * @returns {string}
 */
function escapeRegex(str = '') {
  return str.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  name: 'send',
  description: 'Envia uma mensagem personalizada para um canal específico ou para o canal atual.',
  usage: '${currentPrefix}send [#canal] <mensagem | --embed <mensagem>>',
  userPermissions: [PermissionsBitField.Flags.ManageMessages],
  botPermissions: [PermissionsBitField.Flags.SendMessages],
  deleteMessage: true,

  /**
   * Executa o comando.
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
  async execute(message, args) {
    const prefix =
      (message.client.prefixes && message.client.prefixes.get(message.guild?.id)) || '.';

    if (!args.length) {
      return sendWarning(
        message,
        `Uso incorreto. Forma correta:\n\`${this.usage.replace('${currentPrefix}', prefix)}\``
      );
    }

    // Extrair conteúdo após o comando
    const rawContent = message.content;
    const regex = new RegExp(`^\\s*${escapeRegex(prefix)}${escapeRegex(this.name)}\\b`, 'i');
    let afterCommand = rawContent.replace(regex, '').trim();

    // Identificar canal de destino
    const mentionedChannel = message.mentions.channels.first();
    let targetChannel = message.channel;

    if (mentionedChannel && mentionedChannel.type === ChannelType.GuildText) {
      targetChannel = mentionedChannel;
      afterCommand = afterCommand.replace(mentionedChannel.toString(), '').trim();
    }

    if (!afterCommand) {
      return sendWarning(message, 'Você precisa inserir uma mensagem para enviar.');
    }

    // Verificar se é embed
    const isEmbed = /^--embed\b/i.test(afterCommand);
    let sentMessage;

    try {
      if (isEmbed) {
        const embedText = afterCommand.replace(/^--embed\b/i, '').trim();

        const embed = new EmbedBuilder()
          .setColor(colors.red)
          .setDescription(embedText || '*[sem conteúdo]*')
          .setFooter({
            text: `Enviado por ${message.author.username}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true })
          })
          .setTimestamp();

        sentMessage = await targetChannel.send({ embeds: [embed] });
      } else {
        sentMessage = await targetChannel.send({ content: afterCommand });
      }

      Logger.info(
        `[send] ${message.author.tag} enviou uma mensagem em #${targetChannel.name} (${targetChannel.id})`
      );
    } catch (err) {
      Logger.error(
        `[send] Falha ao enviar mensagem para ${targetChannel.id}: ${err.stack || err.message}`
      );

      return sendWarning(
        message,
        'Não foi possível enviar a mensagem. Verifique as permissões do canal.'
      );
    }

    // Feedback no canal original
    if (targetChannel.id !== message.channel.id) {
      message.channel
        .send({
          content: `${emojis.successEmoji} Sua mensagem foi enviada para ${targetChannel}.`
        })
        .then(m => setTimeout(() => m.delete().catch(() => {}), 5000))
        .catch(() => {});
    }

    // Registrar no ModLog
    try {
      await sendModLog(message.guild, {
        action: 'Send',
        target: targetChannel,
        moderator: message.author,
        reason: isEmbed ? 'Mensagem embed enviada' : 'Mensagem de texto enviada',
        extraFields: [
          {
            name: 'Conteúdo',
            value: afterCommand.length > 1000
              ? `${afterCommand.slice(0, 1000)}...`
              : afterCommand
          }
        ],
        messageId: sentMessage?.id
      });
    } catch (logErr) {
      Logger.warn(`[send] Erro ao registrar log da ação: ${logErr.stack || logErr.message}`);
    }
  }
};
