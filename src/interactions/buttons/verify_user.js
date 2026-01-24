'use strict';

const { EmbedBuilder } = require('discord.js');
const Logger = require('@logger');
const { emojis, colors, channels, roles } = require('@config');

module.exports = {
  customId: 'verify_user',

  /**
   * Executa o botão de verificação
   * @param {import('discord.js').ButtonInteraction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client) {
    const member = interaction.member;
    const guild = interaction.guild;

    if (!guild || !member) {
      return sendEphemeralError(interaction, 'Erro interno. Tente novamente mais tarde.');
    }

    const cargo = guild.roles.cache.get(roles.verified);

    if (!cargo) {
      Logger.error(`[VERIFY] Cargo de verificado não encontrado (${roles.verified})`);
      return sendEphemeralError(interaction, 'Não foi possível encontrar o cargo verificador.');
    }

    if (member.roles.cache.has(roles.verified)) {
      return sendEphemeralError(interaction, 'As regras já estão aceitas em sua conta.');
    }

    try {
      await member.roles.add(cargo);

      Logger.info(`[VERIFY] Cargo verificado adicionado para ${member.user.tag} (${member.id})`);

      await interaction.reply({
        content: `${emojis.done} Pronto! Nossa comunidade já está disponível para você.`,
        flags: 1 << 6
      });

      const logEmbed = new EmbedBuilder()
        .setTitle('Verificação Concluída')
        .setColor(colors.green)
        .addFields(
          { name: 'Usuário', value: `${member.user.tag} (\`${member.id}\`)`, inline: false },
          { name: 'Cargo Adicionado', value: `${cargo.name} (\`${cargo.id}\`)`, inline: false },
          { name: 'Servidor', value: `${guild.name} (\`${guild.id}\`)`, inline: false },
          { name: 'Horário', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
        )
        .setFooter({ text: 'Sistema de Verificação', iconURL: client.user.displayAvatarURL() });

      const logChannel = guild.channels.cache.get(channels.log);
      if (logChannel?.isTextBased()) {
        logChannel.send({ embeds: [logEmbed] }).catch(err =>
          Logger.warn(`[VERIFY] Falha ao enviar log de verificação: ${err.message}`)
        );
      }

    } catch (err) {
      Logger.error(`[VERIFY] Erro ao adicionar cargo de verificado: ${err.stack || err.message}`);
      return sendEphemeralError(interaction, 'Não foi possível verificar você.');
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
