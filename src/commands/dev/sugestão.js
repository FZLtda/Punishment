'use strict';

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionsBitField,
} = require('discord.js');
const Logger = require('@logger');
const { colors, emojis, bot } = require('@config');
const { sendWarning } = require('@embeds/embedWarning');

module.exports = {
  name: 'sugestao',
  description: 'Abre o painel de sugestões com botão e modal.',
  usage: '${currentPrefix}sugestao [#canal|canal_id]',
  category: 'Utilitários',
  userPermissions: ['ManageGuild'],
  botPermissions: ['SendMessages', 'EmbedLinks'],
  deleteMessage: true,

  /**
   * Executa o comando de sugestão.
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
  async execute(message, args) {
    const targetChannel =
      message.mentions.channels.first() ||
      message.guild.channels.cache.get(args[0]) ||
      message.channel;

    if (!targetChannel?.isTextBased?.()) {
      return sendWarning(
        message,
        `${emojis.error} Canal inválido. Informe um canal de texto ou deixe em branco para usar o atual.`
      );
    }

    const me = message.guild.members.me;
    const perms = targetChannel.permissionsFor(me);
    const missing = [];

    if (!perms?.has(PermissionsBitField.Flags.SendMessages)) missing.push('SendMessages');
    if (!perms?.has(PermissionsBitField.Flags.EmbedLinks)) missing.push('EmbedLinks');

    if (missing.length) {
      return sendWarning(
        message,
        `${emojis.error} Não tenho permissões no canal ${targetChannel}.\n` +
          `Permissões faltando: \`${missing.join(', ')}\`.`
      );
    }

    try {
      const embed = new EmbedBuilder()
        .setColor(colors.green)
        .setTitle('Sistema de Sugestões')
        .setDescription(
          [
            'Clique no botão abaixo para enviar sua sugestão.',
            '',
            '• Um modal será aberto pedindo **título** e **descrição**;',
            '• Sua sugestão será enviada ao canal configurado pela staff.',
          ].join('\n')
        )
        .setFooter({
          text: bot.name,
          iconURL: message.client.user.displayAvatarURL(),
        })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('openSuggestionModal')
          .setLabel('Fazer Sugestão')
          .setEmoji(emojis.check)
          .setStyle(ButtonStyle.Success)
      );

      await targetChannel.send({ embeds: [embed], components: [row] });

      if (targetChannel.id !== message.channel.id) {
        const confirm = await message.channel.send(
          `${emojis.successEmoji} Painel de sugestões enviado em ${targetChannel}.`
        );
        setTimeout(() => confirm.delete().catch(() => {}), 5000);
      }

      Logger.info(
        `[commands:sugestao] Painel criado em #${targetChannel.name} por ${message.author.tag}`
      );
    } catch (err) {
      Logger.error(`[commands:sugestao] Erro: ${err.stack || err.message}`);
      return sendWarning(
        message,
        'Não foi possível criar o painel de sugestões devido a um erro inesperado.'
      );
    }
  },
};
