const { EmbedBuilder } = require('discord.js');
const Giveaway = require('../../models/Giveaway');
const { yellow, green } = require('../../config/colors.json');
const { icon_attention } = require('../../config/emoji.json');

module.exports = {
  name: 'giveaway-winners',
  description: 'Mostra os ganhadores de um sorteio finalizado pelo ID da mensagem.',
  usage: '.giveaway winners <messageId>',
  userPermissions: ['SendMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message, args) {
    const messageId = args[0];

    if (!messageId) {
      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Você precisa fornecer o ID da mensagem do sorteio.',
          iconURL: icon_attention,
        });
      return message.channel.send({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    try {
      const sorteio = await Giveaway.findOne({ messageId, guildId: message.guild.id });

      if (!sorteio || !sorteio.ended) {
        const embedAviso = new EmbedBuilder()
          .setColor(yellow)
          .setAuthor({
            name: 'Sorteio não encontrado ou ainda está ativo.',
            iconURL: icon_attention,
          });
        return message.channel.send({ embeds: [embedAviso], allowedMentions: { repliedUser: false } });
      }

      const ganhadores = sorteio.winners || [];

      const dataSorteio = sorteio.createdAt ? sorteio.createdAt.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) : 'Data indisponível';

      const embed = new EmbedBuilder()
        .setTitle(`Sorteio ID: ${sorteio.messageId}`)
        .setColor(green)
        .addFields(
          { name: 'Prêmio', value: sorteio.prize, inline: true },
          { name: 'Ganhadores', value: ganhadores.length ? ganhadores.map(id => `<@${id}>`).join('\n') : 'Nenhum ganhador registrado', inline: false },
          { name: 'Data do Sorteio', value: dataSorteio, inline: true },
        )
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });

    } catch (err) {
      console.error('Erro ao buscar ganhadores:', err);
      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Não foi possível buscar os ganhadores.',
          iconURL: icon_attention,
        });
      return message.channel.send({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  },
};
