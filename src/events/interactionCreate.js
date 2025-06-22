'use strict';

const { EmbedBuilder } = require('discord.js');
const logger = require('@utils/logger');
const { emojis, colors } = require('@config');
const { checkTerms } = require('@handleButton/termsButtons');
const routeInteraction = require('@interactions/router');

/**
 * Evento disparado quando uma interação é criada no Discord.
 * @param {import('discord.js').Interaction} interaction
 * @param {import('discord.js').Client} client
 */
module.exports = {
  name: 'interactionCreate',

  async execute(interaction, client) {
    try {
      const type = getInteractionType(interaction);

      if (!type) {
        logger.warn(`Interação não suportada recebida. Tipo: ${interaction.type}`);
        return;
      }

      const isButton = interaction.isButton?.();
      const isAcceptTerms = isButton && interaction.customId === 'accept_terms';

      if (!isAcceptTerms && (type === 'command' || type === 'button')) {
        const accepted = await checkTerms(interaction);
        if (!accepted) return;
      }

      await routeInteraction(interaction, client, type);
    } catch (error) {
      logger.error(`Erro no evento interactionCreate: ${error.message}`, {
        stack: error.stack,
        user: interaction.user?.tag ?? 'N/A',
        interactionType: interaction.type,
      });

      const embed = new EmbedBuilder()
        .setColor(colors.red ?? '#FE3838')
        .setTitle(`${emojis.attent} Erro ao processar interação`)
        .setDescription('Não foi possível processar esta ação. Tente novamente mais tarde.')
        .setTimestamp();

      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ embeds: [embed], ephemeral: true });
        } else {
          await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      } catch (replyError) {
        logger.error(`Falha ao enviar mensagem de erro para usuário: ${replyError.message}`);
      }
    }
  },
};

/**
 * Retorna o tipo da interação em string, para roteamento.
 * @param {import('discord.js').Interaction} interaction
 * @returns {'command'|'button'|'modal'|'select'|null}
 */
function getInteractionType(interaction) {
  if (interaction.isChatInputCommand?.()) return 'command';
  if (interaction.isButton?.()) return 'button';
  if (interaction.isModalSubmit?.()) return 'modal';
  if (interaction.isStringSelectMenu?.()) return 'select';
  return null;
}
