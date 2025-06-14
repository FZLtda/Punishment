const { EmbedBuilder } = require('discord.js');

function buildEmbed({ color, title, description, author, footer, timestamp = true }) {
  const embed = new EmbedBuilder().setColor(color);
  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);
  if (author) embed.setAuthor(author);
  if (footer) embed.setFooter(footer);
  return embed;
}

module.exports = { buildEmbed };
