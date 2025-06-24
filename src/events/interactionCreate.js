'use strict';

const { EmbedBuilder } = require('discord.js');
const logger = require('@utils/logger');
const { emojis, colors } = require('@config');
const { checkTerms } = require('@handleEvent');
const routeInteraction = require('@interactions/router');

module.exports = {
  name: 'interactionCreate',

  /**
   * Evento disparado quando uma interação é criada no Discord.
   * @param {import('discord.js').Interaction} interaction
   * @param {import('discord.js').Client} client
   */
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
      logger.error('Erro no evento interactionCreate', {
        message: error.message,
        stack: error.stack,
        user: interaction.user?.tag ?? 'N/A',
        interactionType: interaction.type,
      });

      const embed = new EmbedBuilder()
        .setColor(colors.red)
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
        logger.error('Falha ao enviar mensagem de erro para usuário', {
          message: replyError.message,
          stack: replyError.stack,
        });
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
