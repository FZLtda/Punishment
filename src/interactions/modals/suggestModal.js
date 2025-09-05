'use strict';

const { EmbedBuilder } = require('discord.js');
const Logger = require('@logger');
const { colors, emojis, channels, bot } = require('@config');
const { sendWarning } = require('@embeds/embedWarning');

module.exports = {
  customId: 'suggestModal',

  /**
   * Executa o modal de sugestões.
   * @param {import('discord.js').ModalSubmitInteraction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client) {
    const title = interaction.fields.getTextInputValue('suggestTitle');
    const description = interaction.fields.getTextInputValue('suggestDescription');

    Logger.info(`[modal:suggestModal] Sugestão recebida de ${interaction.user.tag}: ${title}`);

    const embed = new EmbedBuilder()
      .setColor(colors.green)
      .setTitle('📢 Nova Sugestão')
      .addFields(
        { name: '👤 Autor', value: `${interaction.user}`, inline: true },
        { name: '📌 Título', value: title || 'Não informado', inline: true },
        { name: '📝 Descrição', value: description || 'Não informado' }
      )
      .setFooter({
        text: bot.name,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTimestamp();

    try {
      const channel = await client.channels.fetch(channels.suggestion);
      if (!channel) {
        return sendWarning(interaction, 'Canal de sugestões não encontrado!');
      }

      const message = await channel.send({ embeds: [embed] });
      await Promise.all([
        message.react(emojis.successEmoji),
        message.react(emojis.errorEmoji),
      ]);

      await interaction.reply({
        content: `${emojis.successEmoji} Mandou bem! Sua sugestão foi enviada!`,
        flags: 1 << 6,
      });
    } catch (err) {
      Logger.error(`[modal:suggestModal] Erro ao processar sugestão: ${err.message}`);
      return sendWarning(
        interaction,
        'Não foi possível processar sua sugestão devido a um erro inesperado.'
      );
    }
  },
};
