'use strict';

const { EmbedBuilder } = require('discord.js');
const { sendWarning } = require('@embeds/embedWarning');
const Giveaway = require('@models/Giveaway');
const { colors, emojis } = require('@config');
const logger = require('@logger');

module.exports = {
  name: 'cancelar',
  description: 'Cancela manualmente um sorteio ativo.',
  usage: '${currentPrefix}cancelar <ID da mensagem>',
  category: 'Utilidades',
  userPermissions: ['ManageMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message, args) {
    const msgId = args[0];

    if (!msgId || !/^\d{17,20}$/.test(msgId)) {
      logger.warn(
        `[CANCELAR] ID inválido fornecido por ${message.author.tag} (${message.author.id})`
      );
      return sendWarning(
        message,
        'Informe um ID de mensagem válido do sorteio que deseja cancelar.'
      );
    }

    const sorteio = await Giveaway.findOne({ messageId: msgId, status: 'ativo' });

    if (!sorteio) {
      logger.warn(`[CANCELAR] Nenhum sorteio ativo encontrado com o ID ${msgId}`);
      return sendWarning(message, 'Não foi encontrado nenhum sorteio ativo com esse ID.');
    }

    sorteio.status = 'cancelado';
    await sorteio.save();

    try {
      const canal = await message.guild.channels.fetch(sorteio.channelId).catch(() => null);
      const mensagem = await canal?.messages?.fetch(msgId).catch(() => null);

      if (mensagem) {
        const embedCancelado = new EmbedBuilder()
          .setTitle(`${emojis.errorEmoji} Sorteio Cancelado`)
          .setDescription(
            'Este sorteio foi cancelado pela administração.\n' +
            'A decisão segue as regras do servidor, garantindo transparência e organização para todos os membros.'
          )
          .addFields({ name: 'Prêmio', value: sorteio.prize })
          .setColor(colors.red)
          .setFooter({
            text: 'Punishment',
            iconURL: message.client.user.displayAvatarURL(),
          })
          .setTimestamp();

        await mensagem.edit({ embeds: [embedCancelado] }).catch(() => null);

        await mensagem.reactions.removeAll().catch(() => null);
      }

      if (message.channel.id !== sorteio.channelId) {
        const confirm = new EmbedBuilder()
          .setColor(colors.green)
          .setDescription(`${emojis.successEmoji} Sorteio **cancelado com sucesso**.`);

        await message.channel.send({
          embeds: [confirm],
          allowedMentions: { repliedUser: false },
        });
      }

      logger.info(
        `[CANCELAR] Sorteio "${sorteio.prize}" cancelado por ${message.author.tag}`
      );
    } catch (err) {
      logger.error(`[CANCELAR] Erro ao cancelar sorteio: ${err.stack || err.message}`);
      return sendWarning(message, 'Não foi possível editar a mensagem do sorteio.');
    }
  },
};
