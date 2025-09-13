'use strict';

const { EmbedBuilder, ChannelType } = require('discord.js');
const { colors, emojis } = require('@config');
const { sendWarning } = require('@embeds/embedWarning');
const { sendModLog } = require('@modules/modlog');
const Logger = require('@logger');

/**
 * Escapa caracteres especiais para uso seguro em regex
 */
function escapeRegex(str = '') {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

module.exports = {
  name: 'send',
  description: 'Envia uma mensagem personalizada para um canal específico ou para o canal atual.',
  usage: '${currentPrefix}send [#canal] <mensagem | --embed <mensagem>>',
  userPermissions: ['ManageMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message, args) {
    const prefix =
      (message.client.prefixes && message.client.prefixes.get(message.guild?.id)) || '.';

    if (!args.length) {
      return sendWarning(
        message,
        'Uso incorreto. Forma correta:\n' +
          `\`${this.usage.replace('${currentPrefix}', prefix)}\``
      );
    }

    const raw = message.content;
    let afterCommand;

    const regex = new RegExp(`^\\s*${escapeRegex(prefix)}${escapeRegex(this.name)}\\b`, 'i');
    afterCommand = raw.replace(regex, '');

    const canalMencionado = message.mentions.channels.first();
    let canalDestino = message.channel;
    let conteudo = afterCommand;

    if (canalMencionado && canalMencionado.type === ChannelType.GuildText) {
      canalDestino = canalMencionado;
      conteudo = conteudo.replace(canalMencionado.toString(), '');
    }

    conteudo = conteudo.trim();

    if (!conteudo) {
      return sendWarning(message, 'Você precisa inserir uma mensagem para enviar.');
    }

    const isEmbed = /^\s*--embed\b/i.test(conteudo);
    let mensagemEnviada;

    try {
      if (isEmbed) {
        const texto = conteudo.replace(/^\s*--embed\b/i, '').trim();

        const embed = new EmbedBuilder()
          .setColor(colors.red)
          .setDescription(texto || '*[sem conteúdo]*')
          .setFooter({
            text: `Enviado por ${message.author.username}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true })
          })
          .setTimestamp();

        mensagemEnviada = await canalDestino.send({ embeds: [embed] });
      } else {
        mensagemEnviada = await canalDestino.send({ content: conteudo });
      }

      Logger.info(
        `[send] Mensagem enviada por ${message.author.tag} em #${canalDestino.name} (${canalDestino.id})`
      );
    } catch (err) {
      Logger.error(
        `[send] Falha ao enviar mensagem para ${canalDestino.id}: ${err.stack || err.message}`
      );
      return sendWarning(
        message,
        'Não foi possível enviar a mensagem. Verifique as permissões do canal.'
      );
    }

    if (canalDestino.id !== message.channel.id) {
      message.channel
        .send({
          content: `${emojis.successEmoji} Sua mensagem foi enviada para ${canalDestino}.`
        })
        .then(m => setTimeout(() => m.delete().catch(() => {}), 5000))
        .catch(() => {});
    }

    // Registro no ModLog
    try {
      await sendModLog(message.guild, {
        action: 'Send',
        target: canalDestino,
        moderator: message.author,
        reason: isEmbed ? 'Mensagem embed enviada' : 'Mensagem de texto enviada',
        extraFields: [
          {
            name: 'Conteúdo',
            value: conteudo.length > 1000 ? `${conteudo.slice(0, 1000)}...` : conteudo
          }
        ],
        messageId: mensagemEnviada?.id
      });
    } catch (logErr) {
      Logger.warn(`[send] Erro ao registrar log da ação: ${logErr.stack || logErr.message}`);
    }
  }
};
