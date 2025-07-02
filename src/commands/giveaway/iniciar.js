'use strict';

const { EmbedBuilder, ChannelType } = require('discord.js');
const Giveaway = require('@models/Giveaway');
const ms = require('ms');
const { colors, emojis } = require('@config');
const Logger = require('@logger');

module.exports = {
  name: 'sorteio',
  description: 'Cria um novo sorteio no canal especificado.',
  usage: '${currentPrefix}sorteio "<prêmio>" <vencedores> <duração> <#canal>',
  category: 'Utilidades',
  userPermissions: ['ManageMessages'],
  botPermissions: ['SendMessages', 'AddReactions'],
  deleteMessage: true,

  async execute(message, args) {
    try {
      // Validação de argumentos com aspas
      const quoteStart = args.findIndex(arg => /^["“]/.test(arg));
      const quoteEnd = args.findIndex((arg, i) => i > quoteStart && /["”]$/.test(arg));

      if (quoteStart === -1 || quoteEnd === -1)
        return erro(message, 'Prêmio inválido. Use aspas, ex: `"Nitro 1 mês"`');

      const prize = args.slice(quoteStart, quoteEnd + 1).join(' ').replace(/^["“]|["”]$/g, '').trim();
      const winnersRaw = args[quoteEnd + 1];
      const durationRaw = args[quoteEnd + 2];
      const canal = message.mentions.channels.first();

      const winners = parseInt(winnersRaw, 10);
      const duration = ms(durationRaw);

      if (!prize || isNaN(winners) || winners <= 0 || !duration || !canal)
        return erro(message, 'Uso incorreto. Exemplo: `!sorteio "Nitro 1 mês" 1 30m #sorteios`');

      if (canal.type !== ChannelType.GuildText)
        return erro(message, 'O canal mencionado precisa ser de texto.');

      const endsAt = new Date(Date.now() + duration);

      const embed = new EmbedBuilder()
        .setTitle('🎉 Sorteio Iniciado!')
        .setDescription([
          `Prêmio: **${prize}**`,
          `Reaja com 🎉 para participar!`,
          `Término: <t:${Math.floor(endsAt.getTime() / 1000)}:R>`
        ].join('\n'))
        .setColor(colors.red)
        .setFooter({
          text: `Serão ${winners} vencedor(es)!`,
          iconURL: message.client.user.displayAvatarURL()
        })
        .setTimestamp();

      const sorteioMsg = await canal.send({ embeds: [embed] });
      await sorteioMsg.react('🎉');

      await Giveaway.create({
        guildId: message.guild.id,
        channelId: canal.id,
        messageId: sorteioMsg.id,
        prize,
        winners,
        endsAt,
        createdBy: message.author.id,
        status: 'ativo',
        participants: []
      });

      Logger.success(`[SORTEIO] Sorteio criado por ${message.author.tag} em ${canal.name} (${message.guild.name})`);

      return message.channel.send({
        content: `${emojis.success} Sorteio iniciado com sucesso em ${canal}.`,
        allowedMentions: { repliedUser: false }
      });

    } catch (err) {
      Logger.error(`[SORTEIO] Erro ao criar sorteio: ${err.stack || err.message}`);
      return erro(message, 'Não foi possível criar o sorteio devido a um erro interno.');
    }
  }
};

function erro(message, texto) {
  const embed = new EmbedBuilder()
    .setColor(colors.red)
    .setDescription(`${emojis.error} ${texto}`);

  return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
}
