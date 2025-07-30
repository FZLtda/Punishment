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
          category.commands.map(cmd => {
            const linha1 = `**${prefix}${cmd.name}**`;
            const linha2 = cmd.description ? `> ${cmd.description}` : null;
            const linha3 = cmd.usage ? `> **Uso:** \`${prefix}${cmd.usage}\`` : null;
            const linha4 = cmd.permissions?.length ? `> **Acesso:** \`${cmd.permissions.join(', ')}\`` : null;
            const linha5 = cmd.details ? `> **Nota:** ${cmd.details}` : null;

            return [linha1, linha2, linha3, linha4, linha5]
              .filter(Boolean)
              .join('\n');
          }).join('\n\n')
        )
        .setFooter({
          text: `${category.name} • Total: ${category.commands.length} comando(s)`,
        });

      await interaction.update({
        embeds: [embed],
        components: interaction.message.components,
      });

      Logger.info(
        `[HELP] Categoria exibida: ${category.name} • Solicitado por ${interaction.user.tag} (${interaction.user.id})`
      );
    } catch (error) {
      Logger.error(
        `[HELP] Erro ao exibir categoria ${selected} para ${interaction.user.tag}: ${error.stack || error.message}`
      );
      return sendWarning(interaction, 'Não foi possível exibir essa categoria.');
    }
  },
};
