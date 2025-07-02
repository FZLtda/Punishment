'use strict';

const { EmbedBuilder, ChannelType } = require('discord.js');
const Giveaway = require('@models/Giveaway');
const ms = require('ms');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'sorteio',
  description: 'Cria um novo sorteio no canal especificado.',
  usage: '${currentPrefix}sorteio "<prêmio>" <vencedores> <duração> <#canal>',
  category: 'Utilidades',
  userPermissions: ['ManageMessages'],
  botPermissions: ['SendMessages', 'AddReactions'],
  deleteMessage: true,

  async execute(message, args) {
    
    const quoteStart = args.findIndex(arg => arg.startsWith('"') || arg.startsWith('“'));
    const quoteEnd = args.findIndex(arg => arg.endsWith('"') || arg.endsWith('”'));

    if (quoteStart === -1 || quoteEnd === -1 || quoteEnd <= quoteStart)
      return erro(message, 'Prêmio inválido. Use aspas, ex: `"Nitro 1 mês"`');

    const prize = args.slice(quoteStart, quoteEnd + 1).join(' ').replace(/^["“]|["”]$/g, '').trim();
    const winnersRaw = args[quoteEnd + 1];
    const durationRaw = args[quoteEnd + 2];
    const canal = message.mentions.channels.first();

    const winners = parseInt(winnersRaw);
    const duration = durationRaw && ms(durationRaw);

    if (!prize || !winners || !duration || !canal)
      return erro(message, 'Uso incorreto. Ex: `!sorteio "Nitro 1 mês" 1 30m #sorteios`');

    if (canal.type !== ChannelType.GuildText)
      return erro(message, 'O canal mencionado precisa ser de texto.');

    const endsAt = new Date(Date.now() + duration);

    const embed = new EmbedBuilder()
      .setTitle('🎉 Sorteio Iniciado!')
      .setDescription(`Prêmio: **${prize}**\nReaja com 🎉 para participar!\nTermina <t:${Math.floor(endsAt / 1000)}:R>`)
      .setColor(colors.red)
      .setFooter({ text: `Serão ${winners} vencedor(es)!`, iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();

    try {
      const sorteioMsg = await canal.send({ embeds: [embed] });
      await sorteioMsg.react('🎉');

      await Giveaway.create({
        guildId: message.guild.id,
        channelId: canal.id,
        messageId: sorteioMsg.id,
        prize,
        winners,
        endsAt,
        createdBy: message.author.id
      });

      const confirm = new EmbedBuilder()
        .setColor(colors.green)
        .setDescription(`${emojis.success} Sorteio iniciado com sucesso em ${canal}.`);

      return message.channel.send({ embeds: [confirm] });

    } catch (err) {
      console.error('[SORTEIO] Falha ao criar sorteio:', err);
      return erro(message, 'Não foi possível criar o sorteio.');
    }
  }
};

function erro(message, texto) {
  const embed = new EmbedBuilder()
    .setColor(colors.red)
    .setDescription(`${emojis.error} ${texto}`);

  return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
}
