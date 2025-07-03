'use strict';

const { EmbedBuilder } = require('discord.js');
const Logger = require('@logger');
const { emojis, colors, channels } = require('@config');

module.exports = {
  id: 'verify_user',

  /**
   * Executa o botão de verificação
   * @param {import('discord.js').ButtonInteraction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client) {
    const member = interaction.member;
    const guild = interaction.guild;

    if (!guild || !member) {
      return interaction.reply({
        content: `${emojis.error} Erro interno. Tente novamente mais tarde.`,
        ephemeral: true
      });
    }

    const cargo = guild.roles.cache.get(CARGO_VERIFICADO_ID);

    if (!cargo) {
      Logger.error(`[VERIFY] Cargo de verificado não encontrado (${CARGO_VERIFICADO_ID})`);
      return interaction.reply({
        content: `${emojis.error} Cargo de verificado não encontrado.`,
        ephemeral: true
      });
    }

    if (member.roles.cache.has(CARGO_VERIFICADO_ID)) {
      return interaction.reply({
        content: `${emojis.attent} Você já está verificado.`,
        ephemeral: true
      });
    }

    try {
      await member.roles.add(cargo);

      Logger.success(`[VERIFY] Cargo verificado adicionado para ${member.user.tag} (${member.id})`);

      await interaction.reply({
        content: `${emojis.success} Você foi verificado com sucesso!`,
        ephemeral: true
      });

      // Enviar log em canal (se configurado)
      const logEmbed = new EmbedBuilder()
        .setTitle('Verificação Concluída')
        .setColor(colors.green)
        .addFields(
          { name: 'Usuário', value: `${member.user.tag} (\`${member.id}\`)`, inline: false },
          { name: 'Cargo Adicionado', value: `${cargo.name} (\`${cargo.id}\`)`, inline: false },
          { name: 'Servidor', value: `${guild.name} (\`${guild.id}\`)`, inline: false },
          { name: 'Horário', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
        )
        .setFooter({ text: 'Punishment • Sistema de Verificação', iconURL: client.user.displayAvatarURL() });

      const logChannel = guild.channels.cache.get(channels.log);
      if (logChannel?.isTextBased()) {
        logChannel.send({ embeds: [logEmbed] }).catch(err =>
          Logger.warn(`[VERIFY] Falha ao enviar log de verificação: ${err.message}`)
        );
      }

    } catch (err) {
      Logger.error(`[VERIFY] Erro ao adicionar cargo de verificado: ${err.stack || err.message}`);
      return interaction.reply({
        content: `${emojis.error} Ocorreu um erro ao tentar verificar você.`,
        ephemeral: true
      });
    }
  }
};
