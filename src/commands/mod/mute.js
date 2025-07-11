'use strict';

const { EmbedBuilder, ChannelType } = require('discord.js');
const { colors, emojis } = require('@config');
const { sendEmbed } = require('@utils/embedReply');
const { sendModLog } = require('@modules/modlog');

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

    const isEmbed = conteudo.startsWith('--embed');
    let mensagemEnviada;

    try {
      if (isEmbed) {
        const texto = conteudo.replace('--embed', '').trim();

        const embed = new EmbedBuilder()
          .setColor(colors.red)
          .setDescription(texto)
          .setFooter({
            text: `${message.author.username}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true })
          })
          .setTimestamp();

        mensagemEnviada = await canal.send({ embeds: [embed] });
      } else {
        mensagemEnviada = await canal.send({ content: conteudo });
      }
    } catch (err) {
      console.error('[send] Erro ao enviar mensagem:', err);
      return sendEmbed('yellow', message, 'Não foi possível enviar a mensagem.');
    }

    // Confirmação silenciosa
    message.channel.send({
      content: `${emojis.successEmoji} Sua mensagem foi enviada.`
    }).catch(() => {});

    // Log da ação
    try {
      await sendModLog('send', {
        executor: message.author,
        channel: canal,
        content: conteudo
      });
    } catch (logErr) {
      console.warn('[send] Erro ao registrar log da ação:', logErr.message);
    }
  }
};
