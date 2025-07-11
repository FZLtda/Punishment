'use strict';

const { EmbedBuilder, ChannelType } = require('discord.js');
const { colors, emojis } = require('@config');
const { sendEmbed } = require('@utils/embedReply');
const { logAction } = require('@modules/modlog');

module.exports = {
  name: 'send',
  description: 'Envia uma mensagem personalizada para um canal específico.',
  usage: '${currentPrefix}send <#canal> <mensagem>',
  userPermissions: ['ManageMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message, args) {
    const canal = message.mentions.channels.first();
    const conteudo = args.slice(1).join(' ');

    if (!canal || canal.type !== ChannelType.GuildText) {
      return sendEmbed('yellow', message, 'Você precisa mencionar um canal de texto válido.');
    }

    if (!conteudo) {
      return sendEmbed('yellow', message, 'Você precisa inserir uma mensagem para enviar.');
    }

    // Embed ou mensagem simples?
    const isEmbed = conteudo.startsWith('--embed');

    try {
      if (isEmbed) {
        const texto = conteudo.replace('--embed', '').trim();

        const embed = new EmbedBuilder()
          .setColor(colors.default)
          .setDescription(texto)
          .setFooter({
            text: `Enviado por ${message.author.username}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true })
          })
          .setTimestamp();

        await canal.send({ embeds: [embed] });
      } else {
        await canal.send({ content: conteudo });
      }

      sendEmbed('green', message, `${emojis.successEmoji} Mensagem enviada com sucesso para ${canal}.`);

      await logAction('send', {
        executor: message.author,
        channel: canal,
        content: conteudo
      });
    } catch (err) {
      console.error(`[send] Erro ao enviar mensagem:`, err);
      return sendEmbed('yellow', message, 'Não foi possível enviar a mensagem.');
    }
  }
};
