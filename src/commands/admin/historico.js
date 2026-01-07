'use strict';

const { EmbedBuilder } = require('discord.js');
const { getPunishmentsByUser } = require('@services/punishmentService');
const { sendWarning } = require('@embeds/embedWarning');
const { colors } = require('@config');

const MAX_RESULTS = 10;

module.exports = {
  name: 'historico',
  description: 'Exibe o histórico de punições de um usuário.',
  deleteMessage: true,

  aliases: [
    'punições',
    'histórico',
    'casos',
    'cases',
    'infractions',
    'punishments',
    'modlog',
    'records'
  ],

  async execute(message, args) {
    try {
      const userId = args[0];

      if (!userId || !/^\d{17,19}$/.test(userId)) {
        return sendWarning(
          message,
          'Informe um ID de usuário válido.'
        );
      }

      const punishments = await getPunishmentsByUser(
        message.guild.id,
        userId
      );

      if (!punishments || punishments.length === 0) {
        return sendWarning(
          message,
          'Este usuário não possui registros de punição.'
        );
      }

      const embed = new EmbedBuilder()
        .setTitle('📑 Histórico de Punições')
        .setColor(colors.red)
        .setDescription(
          `Exibindo os **${Math.min(
            punishments.length,
            MAX_RESULTS
          )}** registros mais recentes.`
        )
        .setFooter({
          text: message.author.tag,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      punishments.slice(0, MAX_RESULTS).forEach((punishment, index) => {
        embed.addFields({
          name: `Caso #${index + 1}`,
          value: [
            `🔨 **Ação:** ${punishment.type}`,
            `👮 **Moderador:** <@${punishment.moderatorId}>`,
            `📝 **Motivo:** ${punishment.reason || 'Não informado.'}`,
            punishment.duration
              ? `⏱️ **Duração:** ${punishment.duration}`
              : null,
            `📅 **Data:** <t:${Math.floor(
              punishment.createdAt / 1000
            )}:f>`
          ]
            .filter(Boolean)
            .join('\n')
        });
      });

      await message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error('[HISTÓRICO]', error);
      return sendWarning(
        message,
        'Não foi possível buscar o histórico de punições.'
      );
    }
  }
};
