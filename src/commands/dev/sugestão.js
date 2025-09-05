'use strict';

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const Logger = require('@logger');
const { colors, emojis, bot } = require('@config');
const { sendWarning } = require('@embeds/embedWarning');
const { checkMemberGuard } = require('@permissions/memberGuards');

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

    const isValid = await checkMemberGuard(message, targetChannel, 'sugestao');
    if (!isValid) return;

    try {
      const embed = new EmbedBuilder()
        .setColor(colors.green)
        .setTitle('Sistema de Sugestões')
        .setDescription(
          [
            'Quer nos ajudar a tornar o **Punishment** ainda melhor?',
            '',
            '• Envie ideias de novos comandos, melhorias ou ajustes;',
            '• Todas as sugestões serão analisadas pela equipe de desenvolvimento;',
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
          .setEmoji(emojis.checkEmoji)
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
