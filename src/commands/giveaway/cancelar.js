'use strict';

const { sendEmbed } = require('@utils/embedReply');
const Giveaway = require('@models/Giveaway');
const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');
const logger = require('@logger');

module.exports = {
  name: 'cancelar',
  description: 'Cancela manualmente um sorteio ativo.',
  usage: '${currentPrefix}cancelar <ID da mensagem>',
  category: 'Utilidades',
  userPermissions: ['ManageMessages'],
  botPermissions: ['SendMessages'],

  async execute(message, args) {
    const msgId = args[0];

    if (!msgId || !/^\d{17,20}$/.test(msgId)) {
      logger.warn(`[CANCELAR] ID inválido fornecido por ${message.author.tag} (${message.author.id})`);
      return sendEmbed('yellow', message, 'Informe um **ID de mensagem válido** do sorteio que deseja cancelar.');
    }

    const sorteio = await Giveaway.findOne({ messageId: msgId, status: 'ativo' });

    if (!sorteio) {
      logger.warn(`[CANCELAR] Nenhum sorteio ativo encontrado com o ID ${msgId}`);
      return sendEmbed('yellow', message, 'Nenhum sorteio **ativo** foi encontrado com esse ID.');
    }

    sorteio.status = 'cancelado';
    await sorteio.save();

    try {
      const canal = await message.guild.channels.fetch(sorteio.channelId).catch(() => null);
      const mensagem = await canal?.messages?.fetch(msgId).catch(() => null);

      if (mensagem) {
        const embedCancelado = new EmbedBuilder()
          .setTitle(`${emojis.error} Sorteio Cancelado`)
          .setDescription('Este sorteio foi **cancelado manualmente** por um administrador.')
          .addFields({ name: 'Prêmio', value: sorteio.prize })
          .setColor(colors.red)
          .setFooter({ text: 'Punishment • Sorteios', iconURL: message.client.user.displayAvatarURL() })
          .setTimestamp();

        await mensagem.edit({ embeds: [embedCancelado] }).catch(() => null);
      }

      const confirm = new EmbedBuilder()
        .setColor(colors.yellow)
        .setDescription(`${emojis.attent} O sorteio foi **cancelado com sucesso**.`);

      logger.info(`[CANCELAR] Sorteio "${sorteio.prize}" cancelado por ${message.author.tag}`);
      return message.channel.send({ embeds: [confirm], allowedMentions: { repliedUser: false } });

    } catch (err) {
      logger.error(`[CANCELAR] Erro ao cancelar sorteio: ${err.stack || err.message}`);
      return sendEmbed('yellow', message, 'Ocorreu um erro ao tentar editar a mensagem do sorteio.');
    }
  }
};
