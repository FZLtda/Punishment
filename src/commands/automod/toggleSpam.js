const { EmbedBuilder } = require('discord.js');
const { manageSpamRule } = require('../../utils/automodUtils');
const { COLORS, MESSAGES } = require('../../config/constants');
const { getAutoModStatus, updateAutoModStatus } = require('../../data/database');

async function toggleSpam(interaction) {
  const guildId = interaction.guild.id;

  const currentStatus = getAutoModStatus(guildId, 'spam');
  const newStatus = !currentStatus;

  updateAutoModStatus(guildId, 'spam', newStatus);

  await manageSpamRule(interaction.guild, newStatus);

  const embed = new EmbedBuilder()
    .setColor(newStatus ? COLORS.SUCCESS : COLORS.ERROR)
    .setDescription(MESSAGES.AUTOMOD.RULE_UPDATED('Anti-Spam', newStatus));

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

module.exports = toggleSpam;