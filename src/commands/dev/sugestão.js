'use strict';

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
} = require('discord.js');

const Logger = require('@logger');
const { colors, emojis, bot } = require('@config');
const { sendWarning } = require('@embeds/embedWarning');

module.exports = {
  name: 'sugestao',
  description: 'Cria o painel oficial de sugestões da comunidade.',
  usage: '${currentPrefix}sugestao [#canal|canal_id]',
  category: 'Utilitários',
  userPermissions: [PermissionFlagsBits.ManageGuild],
  botPermissions: ['SendMessages', 'EmbedLinks'],
  deleteMessage: true,

  /**
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
  async execute(message, args) {
    if (message.author.id !== bot.ownerId) return;

    const targetChannel =
      message.mentions.channels.first() ||
      message.guild.channels.cache.get(args[0]) ||
      message.channel;

    if (!targetChannel?.isTextBased()) {
      return sendWarning(
        message,
        'O canal informado não é válido para criar o painel de sugestões.'
      );
    }

    try {
      const embed = new EmbedBuilder()
        .setColor(colors.green)
        .setTitle('💡 Sistema de Sugestões')
        .setDescription(
          [
            'Sua opinião é muito importante para a evolução do **Punishment**.',
            '',
            '**📌 O que você pode enviar**',
            '• Ideias de novos comandos ou funcionalidades',
            '• Melhorias em sistemas já existentes',
            '• Ajustes que tornem o bot mais útil ou fácil de usar',
            '',
            '**🛠️ O que acontece depois?**',
            '• Todas as sugestões são analisadas pela equipe',
            '• As ideias viáveis entram no planejamento do bot',
            '• Nem todas podem ser aplicadas, mas todas são lidas',
            '',
            '**🕒 Leva menos de 1 minuto**',
            'Clique no botão abaixo, escreva sua ideia e envie',
          ].join('\n')
        )
        .setFooter({
          text: `${bot.name} • Sistema oficial de sugestões`,
          iconURL: message.client.user.displayAvatarURL(),
        })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('openSuggestionModal')
          .setLabel('Enviar sugestão')
          .setEmoji(emojis.checkEmoji)
          .setStyle(ButtonStyle.Success)
      );

      await targetChannel.send({
        embeds: [embed],
        components: [row],
      });

      if (targetChannel.id !== message.channel.id) {
        const confirm = await message.channel.send(
          `${emojis.successEmoji} Painel de sugestões enviado com sucesso em ${targetChannel}.`
        );

        setTimeout(() => confirm.delete().catch(() => {}), 5000);
      }

      Logger.info(
        `[commands:sugestao] Painel criado em #${targetChannel.name} por ${message.author.tag}`
      );

    } catch (error) {
      Logger.error(
        `[commands:sugestao] ${error.stack || error.message}`
      );

      return sendWarning(
        message,
        'Não foi possível criar o painel de sugestões no momento.'
      );
    }
  },
};
