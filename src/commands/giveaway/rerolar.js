'use strict';

const Giveaway = require('@models/Giveaway');
const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'rerolar',
  description: 'Rerola (sorteia novamente) os vencedores de um sorteio encerrado.',
  usage: '${currentPrefix}rerolar <ID da mensagem>',
  category: 'Utilidades',
  userPermissions: ['ManageMessages'],
  botPermissions: ['SendMessages'],

  async execute(message, args) {
    const msgId = args[0];
    if (!msgId) {
      return erro(message, 'Forneça o ID da mensagem do sorteio.');
    }

    const sorteio = await Giveaway.findOne({
      messageId: msgId,
      status: 'encerrado'
    });

    if (!sorteio) {
      return erro(message, 'Nenhum sorteio encerrado foi encontrado com esse ID.');
    }

    const participantes = [...sorteio.participants];
    const ganhadores = [];

    if (participantes.length >= sorteio.winners) {
      for (let i = 0; i < sorteio.winners; i++) {
        const escolhido = participantes.splice(Math.floor(Math.random() * participantes.length), 1)[0];
        if (escolhido) ganhadores.push(`<@${escolhido}>`);
      }
    }

    const embed = new EmbedBuilder()
      .setTitle('🔄 Sorteio Rerolado!')
      .setDescription(
        ganhadores.length
          ? `Prêmio: **${sorteio.prize}**\nNovos vencedores: ${ganhadores.join(', ')}`
          : `Prêmio: **${sorteio.prize}**\nSem participantes suficientes. 😢`
      )
      .setColor(colors.red)
      .setTimestamp()
      .setFooter({
        text: 'Punishment • Novo sorteio',
        iconURL: message.client.user.displayAvatarURL()
      });

    return message.channel.send({ embeds: [embed] });
  }
};

function erro(message, texto) {
  const embed = new EmbedBuilder()
    .setColor(colors.red)
    .setDescription(`${emojis.error} ${texto}`);

  return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
}
