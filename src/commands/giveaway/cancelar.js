'use strict';

const Giveaway = require('@models/Giveaway');
const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'cancelar',
  description: 'Cancela um sorteio ativo manualmente.',
  usage: '${currentPrefix}cancelar <ID da mensagem>',
  category: 'Utilidades',
  userPermissions: ['ManageMessages'],
  botPermissions: ['SendMessages'],

  async execute(message, args) {
    const msgId = args[0];
    if (!msgId) {
      return erro(message, 'Informe o ID da mensagem do sorteio a ser cancelado.');
    }

    const sorteio = await Giveaway.findOne({
      messageId: msgId,
      status: 'ativo'
    });

    if (!sorteio) {
      return erro(message, 'Não encontrei um sorteio ativo com esse ID.');
    }

    sorteio.status = 'cancelado';
    await sorteio.save();

    try {
      const canal = await message.guild.channels.fetch(sorteio.channelId).catch(() => null);
      const mensagem = await canal?.messages?.fetch(msgId).catch(() => null);

      if (mensagem) {
        const embed = new EmbedBuilder()
          .setTitle('⛔ Sorteio Cancelado')
          .setDescription(`Este sorteio foi cancelado manualmente por um administrador.`)
          .addFields({ name: 'Prêmio', value: sorteio.prize })
          .setColor(colors.red)
          .setTimestamp()
          .setFooter({ text: 'Punishment • Sorteios', iconURL: message.client.user.displayAvatarURL() });

        await mensagem.edit({ embeds: [embed] }).catch(() => null);
      }

      const confirm = new EmbedBuilder()
        .setColor(colors.yellow)
        .setDescription(`${emojis.attent} Sorteio cancelado com sucesso.`);

      return message.channel.send({ embeds: [confirm] });

    } catch (err) {
      console.error('[CANCELAR] Falha ao cancelar sorteio:', err);
      return erro(message, 'Erro ao tentar editar a mensagem do sorteio.');
    }
  }
};

function erro(message, texto) {
  const embed = new EmbedBuilder()
    .setColor(colors.red)
    .setDescription(`${emojis.error} ${texto}`);

  return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
}
