const { EmbedBuilder } = require('discord.js');
const Giveaway = require('../../models/Giveaway');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'giveaway-list',
  description: 'Lista os sorteios ativos no servidor.',
  usage: '.giveaway list',
  userPermissions: ['SendMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message) {
    try {
      const sorteios = await Giveaway.find({ guildId: message.guild.id, ended: false });

      if (!sorteios.length) {
        const embedAviso = new EmbedBuilder()
          .setColor(colors.yellow)
          .setAuthor({
            name: 'Nenhum sorteio ativo encontrado neste servidor.',
            iconURL: emojis.icon_attention,
          });
        return message.channel.send({ embeds: [embedAviso], allowedMentions: { repliedUser: false } });
      }

      const embed = new EmbedBuilder()
        .setTitle('Sorteios Ativos')
        .setColor(colors.green)
        .setDescription(sorteios.map((g, i) => 
          `\`${i + 1}.\` **${g.prize}**\nMensagem: [link](https://discord.com/channels/${g.guildId}/${g.channelId}/${g.messageId}) | Termina: <t:${Math.floor(g.endsAt.getTime() / 1000)}:R>`
        ).join('\n'))
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

    } catch (err) {
      console.error('Erro ao listar sorteios:', err);
      const embedErro = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Erro ao buscar os sorteios.',
          iconURL: emojis.icon_attention,
        });
      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  },
};
