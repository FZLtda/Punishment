const { EmbedBuilder } = require('discord.js');
const { cyan } = require('../config/colors.json');
const { getCommandsByCategory } = require('./commandUtils');

function buildHelpEmbed(category) {
  const commands = getCommandsByCategory(category);
  const embed = new EmbedBuilder()
    .setTitle(`📖 Ajuda – ${category}`)
    .setColor(cyan)
    .setDescription(
      commands.length
        ? commands.map(cmd => `\`• ${cmd.name}\` – ${cmd.description || 'Sem descrição.'}`).join('\n')
        : 'Nenhum comando disponível nesta categoria.'
    )
    .setFooter({ text: `Categoria: ${category}` });
  return embed;
}

module.exports = { buildHelpEmbed };
