const Giveaway = require('@models/Giveaway');
const { EmbedBuilder } = require('discord.js');
const { colors } = require('@config');

async function finalizarSorteio(giveaway, client) {
  const canal = await client.channels.fetch(giveaway.channelId).catch(() => null);
  if (!canal) return;

  const mensagem = await canal.messages.fetch(giveaway.messageId).catch(() => null);
  if (!mensagem) return;

  const participantes = giveaway.participants || [];
  const ganhadores = [];

  if (participantes.length >= giveaway.winners) {
    for (let i = 0; i < giveaway.winners; i++) {
      const escolhido = participantes.splice(Math.floor(Math.random() * participantes.length), 1)[0];
      if (escolhido) ganhadores.push(`<@${escolhido}>`);
    }
  }

  const embed = new EmbedBuilder()
    .setTitle('🎉 Sorteio Encerrado!')
    .setDescription(
      ganhadores.length
        ? `Prêmio: **${giveaway.prize}**\nVencedores: ${ganhadores.join(', ')}`
        : `Prêmio: **${giveaway.prize}**\nSem participantes suficientes. 😢`
    )
    .setColor(colors.purple)
    .setTimestamp();

  mensagem.edit({ embeds: [embed] }).catch(() => null);

  giveaway.status = 'encerrado';
  await giveaway.save();
}

module.exports = { finalizarSorteio };
