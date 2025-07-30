'use strict';

const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');
const { getPrefix } = require('@utils/prefixManager');
const { sendWarning } = require('@utils/embedWarning');
const Logger = require('@logger');
const categories = require('@utils/helpCategories');

module.exports = {
  customId: 'help-category',

  async execute(interaction) {
    const selected = interaction.values[0];
    const category = categories.find(c => c.id === selected);

    if (!category) {
      Logger.warn(`[HELP] Categoria inválida selecionada por ${interaction.user.tag} (${interaction.user.id})`);
      return sendWarning(interaction, 'Categoria inválida.');
    }

    try {
      const prefix = await getPrefix(interaction.guildId);

      const embed = new EmbedBuilder()
        .setTitle(`\`\`\`${category.name}\`\`\``)
        .setColor('#FE3838')
        .setAuthor({
          name: 'Comando de ajuda',
          iconURL: emojis.helpIcon,
        })
        .setDescription(
          category.commands.map(cmd => (
            `**${prefix}${cmd.name}**\n> ${cmd.description}\n`
          )).join('\n')
        )
        .setFooter({
          text: `${category.name} • Total: ${category.commands.length} comando(s)`,
        });

      await interaction.update({
        embeds: [embed],
        components: [],
      });

      Logger.info(`[HELP] Categoria exibida: ${category.name} • Solicitado por ${interaction.user.tag} (${interaction.user.id})`);
    } catch (error) {
      Logger.error(`[HELP] Erro ao exibir categoria ${selected} para ${interaction.user.tag}: ${error.stack || error.message}`);
      return sendWarning(interaction, 'Não foi possível exibir essa categoria.');
    }
  },
};
