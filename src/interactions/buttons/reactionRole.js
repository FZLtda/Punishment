'use strict';

const { EmbedBuilder } = require('discord.js');
const { emojis, colors } = require('@config');
const Logger = require('@logger');

module.exports = {
  customId: 'reactionrole',

  /**
   * Handler do botão reactionrole
   * @param {import('discord.js').ButtonInteraction} interaction
   * @param {import('discord.js').Client} client
   */
  
  async execute(interaction, client) {
    if (!interaction.customId.startsWith('reactionrole:')) return;

    const roleId = interaction.customId.split(':')[1];
    const role = interaction.guild.roles.cache.get(roleId);

    if (!role) {
      Logger.warn(`[BUTTON] Cargo reactionrole não encontrado: ${roleId}`);
      return sendEphemeralError(interaction, 'Cargo não encontrado.');
    }

    const member = interaction.member;

    try {
      if (member.roles.cache.has(roleId)) {
        await member.roles.remove(roleId);
        await interaction.reply({
          content: `${emojis.info} Cargo removido com sucesso.`,
          flags: 1 << 6
        });
        return;
      }

      await member.roles.add(roleId);
      await interaction.reply({
        content: `${emojis.successEmoji} Cargo adicionado com sucesso!`,
        flags: 1 << 6
      });
    } catch (err) {
      Logger.error(`[BUTTON] Erro ao atribuir/remover cargo: ${err.stack || err.message}`);
      return sendEphemeralError(interaction, 'Erro ao modificar seu cargo. Permissões insuficientes?');
    }
  }
};

/**
 * Envia erro discreto ao usuário via embed autor
 * @param {import('discord.js').Interaction} interaction
 * @param {string} texto
 */
function sendEphemeralError(interaction, texto) {
  const embed = new EmbedBuilder()
    .setColor(colors.yellow)
    .setAuthor({ name: texto, iconURL: emojis.attentionIcon });

  return interaction.reply({ embeds: [embed], flags: 1 << 6 }).catch(() => {});
}
