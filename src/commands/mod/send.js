'use strict';

const { EmbedBuilder, ChannelType } = require('discord.js');
const { colors, emojis } = require('@config');
const { sendWarning } = require('@embeds/embedWarning');
const { sendModLog } = require('@modules/modlog');
const Logger = require('@logger');

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
      return sendWarning(message, 'Você precisa mencionar um canal de texto válido.');
    }

    if (!conteudo) {
      return sendWarning(message, 'Você precisa inserir uma mensagem para enviar.');
    }

    const isEmbed = conteudo.startsWith('--embed');
    let mensagemEnviada;

    try {
      if (isEmbed) {
        const texto = conteudo.replace('--embed', '').trim();

        const embed = new EmbedBuilder()
          .setColor(colors.red)
          .setDescription(texto || '*[sem conteúdo]*')
          .setFooter({
            text: message.author.username,
            iconURL: message.author.displayAvatarURL({ dynamic: true })
          })
          .setTimestamp();

        mensagemEnviada = await canal.send({ embeds: [embed] });
      } else {
        mensagemEnviada = await canal.send({ content: conteudo });
      }
    } catch (err) {
      Logger.error(`[send] Falha ao enviar mensagem: ${err.message}`);
      return sendWarning(message, 'Não foi possível enviar a mensagem. Verifique as permissões do canal.');
    }

    if (canal.id !== message.channel.id) {
      message.channel.send({
        content: `${emojis.successEmoji} Sua mensagem foi enviada para ${canal}.`
      }).catch(() => {});
    }

    // Registro no ModLog
    try {
      await sendModLog('send', {
        executor: message.author,
        channel: canal,
        content: conteudo,
        isEmbed
      });
    } catch (logErr) {
      Logger.warn(`[send] Erro ao registrar log da ação: ${logErr.message}`);
    }
  }
};
