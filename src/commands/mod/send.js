'use strict';

const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { colors, emojis } = require('@config');
const { sendWarning } = require('@embeds/embedWarning');
const { sendModLog } = require('@modules/modlog');

module.exports = {
  name: 'send',
  description: 'Envia uma mensagem para um canal específico ou para o canal atual.',
  usage: '${currentPrefix}send [#canal] <mensagem>',
  userPermissions: ['ManageMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message, args) {
    const rawContent = message.content;
    const commandLength = rawContent.indexOf(' ') > -1 ? rawContent.indexOf(' ') + 1 : rawContent.length;
    const afterCommand = rawContent.slice(commandLength).trim();

    if (!afterCommand) {
      return sendWarning(message, 'Você precisa fornecer uma mensagem para enviar.');
    }

    const targetChannelMention = message.mentions.channels.first();
    let targetChannel;
    let content;

    if (targetChannelMention) {
      targetChannel = targetChannelMention;

      const mentionString = `<#${targetChannel.id}>`;
      const mentionIndex = afterCommand.indexOf(mentionString);
      if (mentionIndex === -1) return sendWarning(message, 'Erro ao processar a menção do canal.');

      content = afterCommand.slice(mentionIndex + mentionString.length).trim();
      if (!content) return sendWarning(message, 'Você precisa fornecer uma mensagem para enviar.');

      if (targetChannel.type !== ChannelType.GuildText) {
        return sendWarning(message, 'Só é possível enviar mensagens em canais de texto.');
      }

    } else {
      targetChannel = message.channel;
      content = afterCommand;
    }

    if (content.length > 2000) {
      return sendWarning(message, 'A mensagem é muito longa. Limite máximo: 2000 caracteres.');
    }

    const botMember = await message.guild.members.fetch(message.client.user.id);
    const botPermissions = targetChannel.permissionsFor(botMember);

    if (!botPermissions || !botPermissions.has(PermissionFlagsBits.SendMessages)) {
      return sendWarning(message, `Não tenho permissão para enviar mensagens em ${targetChannel}.`);
    }

    try {
      await targetChannel.send({ content });

      if (targetChannelMention) {
        const confirmation = await message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${emojis.successEmoji} Mensagem enviada`)
              .setColor(colors.green)
              .setDescription(`Sua mensagem foi enviada para ${targetChannel}.`)
              .setFooter({
                text: message.author.username,
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
              })
              .setTimestamp()
          ]
        });

        setTimeout(() => {
          confirmation.delete().catch(() => null);
        }, 5000);
      }

      // Log no modlog
      await sendModLog(message.guild, {
        action: 'Send',
        target: targetChannel,
        moderator: message.author,
        reason: 'Envio manual de mensagem',
        extraFields: [{ name: 'Conteúdo', value: content.slice(0, 1000) }],
      });

    } catch (error) {
      console.error('[send] Erro ao enviar mensagem:', error);
      return sendWarning(message, 'Não foi possível enviar a mensagem devido a um erro inesperado.');
    }
  }
};
