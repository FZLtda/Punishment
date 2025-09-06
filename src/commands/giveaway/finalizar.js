'use strict';

const { sendWarning } = require('@embeds/embedWarning');
const { finalizarSorteio } = require('@utils/sorteios');
const Giveaway = require('@models/Giveaway');
const { emojis } = require('@config');
const Logger = require('@logger');

module.exports = {
  name: 'finalizar',
  description: 'Finaliza manualmente um sorteio ativo.',
  usage: '${currentPrefix}finalizar <ID_da_mensagem>',
  category: 'Sorteios',
  userPermissions: ['ManageMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message, args) {
    const messageId = args[0];

    if (!messageId) {
      Logger.warn(`[SORTEIO] Uso inválido por ${message.author.tag} (${message.author.id})`);
      return sendWarning(message, 'Você precisa informar o ID da mensagem do sorteio.');
    }

    try {
      const giveaway = await this.validarSorteio(message.guild.id, messageId);
      if (!giveaway) return sendWarning(message, 'Não há sorteio ativo correspondente a este ID.');

      await finalizarSorteio(giveaway, message.client);

      await this.enviarConfirmacao(message, giveaway);

      Logger.info(`[SORTEIO] Sorteio finalizado manualmente | ID: ${giveaway.messageId} | Prêmio: "${giveaway.prize}" | Por: ${message.author.tag}`);

    } catch (error) {
      Logger.error(`[SORTEIO] Erro ao finalizar sorteio manualmente: ${error.stack || error.message}`);
      return sendWarning(message, 'Não foi possível finalizar o sorteio.');
    }
  },

  /**
   * Valida se o sorteio existe e está ativo
   * @param {string} guildId 
   * @param {string} messageId 
   * @returns {Promise<Giveaway|null>}
   */
  async validarSorteio(guildId, messageId) {
    const giveaway = await Giveaway.findOne({
      guildId,
      messageId,
      status: 'ativo'
    });

    if (!giveaway) {
      Logger.warn(`[SORTEIO] Sorteio não encontrado ou já encerrado (ID: ${messageId})`);
      return null;
    }

    return giveaway;
  },

  /**
   * Envia mensagem de confirmação se o comando for em outro canal
   * @param {Message} message 
   * @param {Giveaway} giveaway 
   */
  async enviarConfirmacao(message, giveaway) {
    if (message.channel.id === giveaway.channelId) return;

    return message.channel.send({
      content: `${emojis.successEmoji} O sorteio **${giveaway.prize}** foi finalizado com sucesso.`,
      allowedMentions: { repliedUser: false }
    });
  }
};
