const { EmbedBuilder } = require('discord.js');
const { manageLinkBlockRule } = require('../../utils/automodUtils');
const { COLORS, MESSAGES } = require('../../config/constants');
const { getAutoModStatus, updateAutoModStatus } = require('../../data/database');

async function toggleLinks(interaction) {
  const guildId = interaction.guild.id;

  const currentStatus = getAutoModStatus(guildId, 'links');
  const newStatus = !currentStatus;

  updateAutoModStatus(guildId, 'links', newStatus);

  await manageLinkBlockRule(interaction.guild, newStatus);

  const embed = new EmbedBuilder()
    .setColor(newStatus ? COLORS.SUCCESS : COLORS.ERROR)
    .setDescription(MESSAGES.AUTOMOD.RULE_UPDATED('Bloqueio de Links', newStatus));

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

module.exports = toggleLinks;