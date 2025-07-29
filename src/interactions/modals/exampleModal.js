'use strict';

const { EmbedBuilder } = require('discord.js');
const Logger = require('@logger');
const { colors, emojis } = require('@config');

module.exports = {
  customId: 'open_example_modal',

  /**
   * Executa um modal de exemplo.
   * @param {import('discord.js').ModalSubmitInteraction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client) {
    const name = interaction.fields.getTextInputValue('name_input');
    const feedback = interaction.fields.getTextInputValue('feedback_input');

    Logger.info(`[modal] Feedback recebido de ${interaction.user.tag}: ${name} — ${feedback}`);

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.feedback || '📝'} Feedback recebido`)
      .setColor(colors.green)
      .setDescription([
        `Obrigado, **${name}**!`,
        '',
        'Recebemos seu feedback:',
        `> ${feedback}`
      ].join('\n'))
      .setFooter({
        text: 'Formulário de Feedback',
        iconURL: client.user.displayAvatarURL()
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      flags: 1 << 6
    });
  }
};
