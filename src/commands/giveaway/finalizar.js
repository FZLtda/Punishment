'use strict';

const { PermissionsBitField } = require('discord.js');
const { sendWarning } = require('@embeds/embedWarning');
const { finalizarSorteio } = require('@utils/sorteios');
const Giveaway = require('@models/Giveaway');
const { emojis } = require('@config');
const logger = require('@logger');

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

    /* Validação do ID*/
    if (!messageId || !/^\d{17,20}$/.test(messageId)) {
      logger.warn(
        `[FINALIZAR] ID inválido fornecido por ${message.author.tag} (${message.author.id})`
      );

      return sendWarning(
        message,
        'Informe um ID de mensagem válido do sorteio que deseja finalizar.'
      );
    }

    try {
      /* Busca segura por servidor */
      const giveaway = await Giveaway.findOne({
        guildId: message.guild.id,
        messageId,
        status: 'ativo',
      });

      if (!giveaway) {
        logger.warn(
          `[FINALIZAR] Sorteio não encontrado ou fora do servidor | ID: ${messageId} | Guild: ${message.guild.id}`
        );

        return sendWarning(
          message,
          'Não há sorteio ativo neste servidor correspondente a este ID.'
        );
      }

      /* Autorização */
      const isCreator = giveaway.createdBy === message.author.id;
      const isAdmin = message.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      );

      if (!isCreator && !isAdmin) {
        logger.warn(
          `[FINALIZAR] Tentativa não autorizada por ${message.author.tag} (${message.author.id})`
        );

        return sendWarning(
          message,
          'Apenas o **criador do sorteio** ou um **administrador** podem finalizá-lo.'
        );
      }

      /* Finalização */
      await finalizarSorteio(giveaway, message.client);

      /* Confirmação */
      if (message.channel.id !== giveaway.channelId) {
        await message.channel.send({
          content: `${emojis.successEmoji} O sorteio **${giveaway.prize}** foi finalizado com sucesso.`,
          allowedMentions: { repliedUser: false },
        });
      }

      logger.info(
        `[FINALIZAR] Sorteio "${giveaway.prize}" (${giveaway.messageId}) finalizado por ${message.author.tag} (${message.author.id})`
      );
    } catch (error) {
      logger.error(
        `[FINALIZAR] Erro ao finalizar sorteio | ID: ${messageId} | ${error.stack || error.message}`
      );

      return sendWarning(
        message,
        'Não foi possível finalizar o sorteio no momento.'
      );
    }
  },
};
