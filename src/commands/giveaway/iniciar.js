'use strict';

const { EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { sendWarning } = require('@embeds/embedWarning');
const { getPrefix } = require('@helpers/prefixManager');
const { colors, emojis } = require('@config');
const Giveaway = require('@models/Giveaway');
const logger = require('@logger');
const ms = require('ms');

module.exports = {
  name: 'sorteio',
  description: '🎉 Inicia um sorteio em um canal.',
  usage: '<prêmio> <vencedores> <duração> <#canal>',
  category: 'Utilidades',
  userPermissions: [PermissionFlagsBits.ManageMessages],
  botPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions],
  deleteMessage: true,

  async execute(message, args) {
    const prefix = await getPrefix(message.guild?.id);

    if (args.length < 4) {
      return sendWarning(message, `Uso correto: ${prefix}${this.usage}`);
    }

    // Detecta o canal
    const canalMention = args[args.length - 1];
    const canalId = canalMention.replace(/[<#>]/g, '');
    const canal = message.guild.channels.cache.get(canalId);

    // Detecta duração
    const duracaoRaw = args[args.length - 2];
    const duracao = ms(duracaoRaw);

    // Detecta número de vencedores
    const vencedoresRaw = args[args.length - 3];
    const vencedores = parseInt(vencedoresRaw, 10);

    // O resto é o prêmio
    const premio = args.slice(0, args.length - 3).join(' ');

    // Validações
    if (!premio || isNaN(vencedores) || vencedores <= 0 || !duracao || duracao < 10000 || !canal) {
      return sendWarning(message, 'Parâmetros inválidos. Preencha todos corretamente.');
    }

    if (canal.type !== ChannelType.GuildText) {
      return sendWarning(message, 'Mencione um canal de texto válido.');
    }

    const terminaEm = new Date(Date.now() + duracao);
    const plural = vencedores === 1 ? 'vencedor' : 'vencedores';

    const embed = new EmbedBuilder()
      .setTitle('🎉 Novo Sorteio!')
      .setDescription([
        `**Prêmio:** ${premio}`,
        `**Participe:** Reaja com 🎉`,
        `**Duração:** Termina <t:${Math.floor(terminaEm.getTime() / 1000)}:R>`
      ].join('\n'))
      .setColor(colors.primary || colors.red)
      .setFooter({
        text: `Ser${vencedores === 1 ? 'á' : 'ão'} ${vencedores} ${plural}`,
        iconURL: message.client.user.displayAvatarURL()
      })
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

      logger.info(`[SORTEIO] Criado | Por: ${message.author.tag} | Prêmio: "${premio}" | Canal: ${canal.name}`);

      if (canal.id !== message.channel.id) {
        return message.channel.send({
          content: `${emojis.successEmoji} Sorteio criado em ${canal}!`,
          allowedMentions: { repliedUser: false }
        });
      }

    } catch (err) {
      logger.error(`[SORTEIO] Erro: ${err.stack || err.message}`);
      return sendWarning(message, 'Erro interno ao criar sorteio. Tente novamente.');
    }
  }
};
