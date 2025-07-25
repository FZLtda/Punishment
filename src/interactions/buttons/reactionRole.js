'use strict';

const { sendEmbed } = require('@utils/embedReply');
const { emojis } = require('@config');

/**
 * Handler de botão para atribuição de cargo via reactionrole.
 * @param {import('discord.js').ButtonInteraction} interaction
 */
module.exports = async (interaction) => {
  if (!interaction.customId.startsWith('reactionrole:')) return;

  const roleId = interaction.customId.split(':')[1];
  const role = interaction.guild.roles.cache.get(roleId);

  if (!role) {
    return interaction.reply({
      content: `${emojis.errorEmoji} Cargo não encontrado.`,
      ephemeral: true
    });
  }

  const member = interaction.member;

  if (member.roles.cache.has(roleId)) {
    await member.roles.remove(roleId);
    return interaction.reply({
      content: `${emojis.warn} Cargo ${role.name} removido.`,
      ephemeral: true
    });
  }

  try {
    await member.roles.add(roleId);
    return interaction.reply({
      content: `${emojis.successEmoji} Cargo ${role.name} atribuído com sucesso.`,
      ephemeral: true
    });
  } catch (error) {
    console.error('[reactionrole button] Erro ao atribuir cargo:', error);
    return interaction.reply({
      content: `${emojis.errorEmoji} Não foi possível atribuir o cargo. Verifique permissões.`,
      ephemeral: true
    });
  }
};
