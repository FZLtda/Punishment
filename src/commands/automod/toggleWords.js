const { EmbedBuilder } = require('discord.js');
const { manageWordBlockRule } = require('../../utils/automodUtils');
const { COLORS, MESSAGES } = require('../../config/constants');
const { getAutoModStatus, updateAutoModStatus } = require('../../data/database');

async function toggleWords(interaction) {
  const guildId = interaction.guild.id;

  const currentStatus = getAutoModStatus(guildId, 'words');
  const newStatus = !currentStatus;

  updateAutoModStatus(guildId, 'words', newStatus);

  await manageWordBlockRule(interaction.guild, newStatus);

  const embed = new EmbedBuilder()
    .setColor(newStatus ? COLORS.SUCCESS : COLORS.ERROR)
    .setDescription(MESSAGES.AUTOMOD.RULE_UPDATED('Bloqueio de Palavras', newStatus));

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

module.exports = toggleWords;