'use strict';

const { EmbedBuilder } = require('discord.js');
const Logger = require('@logger');
const { emojis, colors } = require('@config');

module.exports = {
  customId: 'suggestion_modal',

  /**
   * Executa o modal de sugestão
   * @param {import('discord.js').ModalSubmitInteraction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client) {
    const suggestion = interaction.fields.getTextInputValue('suggestion_text');
    const channelId = process.env.SUGGESTIONS_CHANNEL;
    const channel = interaction.guild.channels.cache.get(channelId);

    if (!channel) {
      Logger.error(`[SUGGESTION] Canal não encontrado (${channelId})`);
      return interaction.reply({
        content: `${emojis.error} O canal de sugestões não foi encontrado.`,
        flags: 1 << 6
      });
    }

    try {
      const embed = new EmbedBuilder()
        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
        .setDescription(suggestion)
        .setColor(colors.secondary)
        .setTimestamp();

      const sentMessage = await channel.send({ embeds: [embed] });
      await sentMessage.react('👍');
      await sentMessage.react('👎');

      return interaction.reply({
        content: `${emojis.success} Sua sugestão foi enviada com sucesso!`,
        flags: 1 << 6
      });
    } catch (err) {
      Logger.error(`[SUGGESTION] Falha ao enviar sugestão: ${err.stack || err.message}`);
      return interaction.reply({
        content: `${emojis.error} Não foi possível enviar sua sugestão.`,
        flags: 1 << 6
      });
    }
  }
};
