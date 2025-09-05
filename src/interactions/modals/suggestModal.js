'use strict';

const { EmbedBuilder } = require('discord.js');
const Logger = require('@logger');
const { colors, emojis, channels } = require('@config');


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

    Logger.info(`[modal:suggestModal] Nova sugestão de ${interaction.user.tag}: ${title}`);

    const embed = new EmbedBuilder()
      .setColor(colors.green)
      .setTitle('Nova Sugestão')
      .addFields(
        { name: '👤 Autor', value: `${interaction.user}`, inline: true },
        { name: '📌 Título', value: title, inline: true },
        { name: '📝 Descrição', value: description }
      )
      .setFooter({
        text: bot.name,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTimestamp();

    try {
      const channel = await client.channels.fetch(channels.suggestion);
      if (!channel) {
        return interaction.reply({ content: 'Canal de sugestões não encontrado!', flags: 1 << 6 });
      }

      const message = await channel.send({ embeds: [embed] });
      await message.react('👍');
      await message.react('👎');

      await interaction.reply({
        content: `${emojis.successEmoji} Sua sugestão foi enviada com sucesso!`,
        flags: 1 << 6,
      });
    } catch (err) {
      Logger.error(`[modal:suggestModal] Erro: ${err.message}`);
      await interaction.reply({
        content: 'Não foi possível processar sua sugestão!',
        flags: 1 << 6,
      });
    }
  },
};
