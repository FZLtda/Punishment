'use strict';

const { EmbedBuilder, ChannelType } = require('discord.js');
const Giveaway = require('@models/Giveaway');
const ms = require('ms');
const { colors, emojis } = require('@config');
const logger = require('@logger');

module.exports = {
  name: 'sorteio',
  description: 'Cria um novo sorteio no canal especificado.',
  usage: '${currentPrefix}sorteio "<prêmio>" <vencedores> <duração> <#canal>',
  category: 'Utilidades',
  userPermissions: ['ManageMessages'],
  botPermissions: ['SendMessages', 'AddReactions'],
  deleteMessage: true,

  async execute(message, args) {
    const conteudo = message.content.trim();

    const regex = /["“](.+?)["”]\s+(\d+)\s+(\S+)\s+<#(\d+)>/;
    const match = conteudo.match(regex);

    if (!match) {
      logger.warn(`[SORTEIO] Formato inválido por ${message.author.tag} (${message.author.id})`);
      return erro(message, 'Formato inválido. Use: `!sorteio "Nitro 1 mês" 1 30m #sorteios`');
    }

    const [_, premio, vencedoresRaw, duracaoRaw, canalId] = match;
    const vencedores = parseInt(vencedoresRaw, 10);
    const duracao = ms(duracaoRaw);
    const canal = message.guild.channels.cache.get(canalId);

    if (!premio || !vencedores || !duracao || !canal) {
      logger.warn(`[SORTEIO] Dados inválidos: premio=${premio}, vencedores=${vencedores}, duracao=${duracao}, canal=${canalId}`);
      return erro(message, 'Parâmetros inválidos. Verifique todos os campos.');
    }

    if (canal.type !== ChannelType.GuildText) {
      logger.warn(`[SORTEIO] Canal inválido (${canalId}) por ${message.author.tag}`);
      return erro(message, 'O canal mencionado precisa ser um canal de texto.');
    }

    const terminaEm = new Date(Date.now() + duracao);

    const embed = new EmbedBuilder()
      .setTitle('🎉 Sorteio Iniciado!')
      .setDescription(`Prêmio: **${premio}**\nReaja com 🎉 para participar!\nTermina <t:${Math.floor(terminaEm.getTime() / 1000)}:R>`)
      .setColor(colors.red)
      .setFooter({ text: `Serão ${vencedores} vencedor(es)!`, iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();

    try {
      const sorteioMsg = await canal.send({ embeds: [embed] });
      await sorteioMsg.react('🎉');

      await Giveaway.create({
        guildId: message.guild.id,
        channelId: canal.id,
        messageId: sorteioMsg.id,
        prize: premio,
        winners: vencedores,
        endsAt: terminaEm,
        createdBy: message.author.id
      });

      const confirm = ` ${emojis.success} Sorteio criado com sucesso em ${canal}!`;
      logger.info(`[SORTEIO] Novo sorteio criado por ${message.author.tag}: "${premio}" em ${canal.name}`);
      return message.channel.send({ content: confirm });

    } catch (err) {
      logger.error(`[SORTEIO] Erro ao criar sorteio: ${err.stack || err.message}`);
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
