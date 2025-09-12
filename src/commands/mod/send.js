'use strict';

const { EmbedBuilder, ChannelType } = require('discord.js');
const { colors, emojis } = require('@config');
const { sendWarning } = require('@embeds/embedWarning');
const { sendModLog } = require('@modules/modlog');
const Logger = require('@logger');

module.exports = {
  name: 'send',
  description: 'Envia uma mensagem personalizada para um canal específico ou para o canal atual.',
  usage: '${currentPrefix}send [#canal] <mensagem>',
  userPermissions: ['ManageMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message, args) {
    let canal;
    let conteudo;

    const mencionado = message.mentions.channels.first();
    if (mencionado && mencionado.type === ChannelType.GuildText) {
      canal = mencionado;
      conteudo = message.content
        .replace(`${args[0]}`, '')
        .replace(mencionado.toString(), '')
        .trim();
    } else {
      canal = message.channel;
      conteudo = message.content
        .replace(`${args[0]}`, '')
        .trim();
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
      }).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 5000);
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
