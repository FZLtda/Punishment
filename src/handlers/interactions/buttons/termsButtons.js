const { EmbedBuilder } = require('discord.js');
const Terms = require('../../../models/Terms');
const { check, error } = require('../../../config/emoji.json');
const { green } = require('../../../config/colors.json');
const logger = require('../../../utils/logger');

async function handleTermsButtons(interaction) {
  if (interaction.customId !== 'accept_terms') return;

  const userId = interaction.user.id;
  const alreadyAccepted = await Terms.exists({ userId });
  if (alreadyAccepted) {
    return interaction.reply({
      ephemeral: true,
      content: `${check} Você já aceitou os termos anteriormente.`,
    });
  }

  try {
    await Terms.create({ userId });

    const embed = new EmbedBuilder()
      .setColor(green)
      .setTitle('Termos Aceitos')
      .setDescription(`${check} Você aceitou os Termos de Uso com sucesso!`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });

    logger.info(`Termos aceitos por ${interaction.user.tag} (${userId})`);
  } catch (err) {
    if (err.code === 11000) {
      return interaction.reply({
        ephemeral: true,
        content: `${check} Você já aceitou os termos anteriormente.`,
      });
    }

    logger.error(`Erro ao salvar termos no banco: ${err.message}`, { stack: err.stack });
    return interaction.reply({
      ephemeral: true,
      content: `${error} Ocorreu um erro ao processar sua aceitação dos termos.`,
    });
  }
}

module.exports = handleTermsButtons;
