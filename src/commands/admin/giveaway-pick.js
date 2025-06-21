const { EmbedBuilder } = require('discord.js');
const Giveaway = require('@models/Giveaway');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'giveaway-pick',
  description: 'Escolhe manualmente os vencedores de um sorteio ainda ativo.',
  usage: '.giveaway pick <messageId>',
  userPermissions: ['Administrator'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message, args) {
    const messageId = args[0];
    if (!messageId) {
      return enviarErro(message, 'Você precisa informar o ID da mensagem do sorteio.');
    }

    try {
      const sorteio = await Giveaway.findOne({ messageId, guildId: message.guild.id });

      if (!sorteio) return enviarErro(message, 'Sorteio não encontrado.');
      if (sorteio.ended) return enviarErro(message, 'Este sorteio já foi finalizado.');
      if (!sorteio.participants.length) return enviarErro(message, 'Nenhum participante registrado neste sorteio.');

      const canal = await message.client.channels.fetch(sorteio.channelId).catch(() => null);
      if (!canal) return enviarErro(message, 'Canal do sorteio não encontrado.');

      const mensagem = await canal.messages.fetch(sorteio.messageId).catch(() => null);
      if (!mensagem) return enviarErro(message, 'Mensagem do sorteio não encontrada.');

      const ganhadores = [];
      const participantes = [...sorteio.participants];

      for (let i = 0; i < sorteio.winnerCount && participantes.length > 0; i++) {
        const index = Math.floor(Math.random() * participantes.length);
        ganhadores.push(participantes.splice(index, 1)[0]);
      }

      const mencoes = ganhadores.map(id => `<@${id}>`).join(', ');
      const plural = ganhadores.length > 1;

      const embed = new EmbedBuilder()
        .setTitle(`Sorteio Finalizado (ID: ${messageId})`)
        .setColor(colors.green)
        .setDescription(
          `**Prêmio:** \`${sorteio.prize}\`\n` +
          `**Participantes:** \`${sorteio.participants.length + ganhadores.length}\`\n` +
          `**Ganhador${plural ? 'es' : ''}:** ${ganhadores.length ? mencoes : '`Nenhum vencedor`'}\n` +
          `**Data:** <t:${Math.floor(Date.now() / 1000)}:f>`
        )
        .setFooter({
          text: `Sorteado por ${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await mensagem.edit({ embeds: [embed], components: [] });

      const mensagemGanhadores = plural
        ? `🎉 Parabéns ${mencoes}! Vocês ganharam **${sorteio.prize}**!`
        : `🎉 Parabéns ${mencoes}! Você ganhou **${sorteio.prize}**!`;

      await canal.send(mensagemGanhadores);

      sorteio.ended = true;
      sorteio.winners = ganhadores;
      sorteio.participants = participantes;
      await sorteio.save();

    } catch (err) {
      console.error(`[Erro] .giveaway pick: ${err}`);
      enviarErro(message, 'Erro ao tentar sortear os ganhadores.');
    }
  },
};

function enviarErro(message, texto) {
  const embed = new EmbedBuilder()
    .setColor(colors.yellow)
    .setAuthor({ name: texto, iconURL: emojis.icon_attention });
  return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
}
