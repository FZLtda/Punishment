'use strict';

const { EmbedBuilder } = require('discord.js');
const { sendModLog } = require('@modules/modlog');
const { colors, emojis } = require('@config');

module.exports = {
  customId: /^addRoleSelect:(\d+)$/,
  async execute(interaction, match) {
    const memberId = match[1];
    const cargoId = interaction.values[0];
    const target = await interaction.guild.members.fetch(memberId).catch(() => null);

    if (!target) {
      return interaction.update({ content: 'Usuário não encontrado.', components: [], ephemeral: true });
    }

    const cargo = interaction.guild.roles.cache.get(cargoId);
    if (!cargo) {
      return interaction.update({ content: 'Cargo inválido ou removido.', components: [], ephemeral: true });
    }

    if (target.roles.cache.has(cargoId)) {
      return interaction.update({ content: 'Esse usuário já possui o cargo selecionado.', components: [], ephemeral: true });
    }

    try {
      await target.roles.add(cargo);

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.success} Cargo Adicionado`)
        .setColor(colors.green)
        .setDescription(`O cargo \`${cargo.name}\` foi atribuído a ${target}.`)
        .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `Ação por ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await interaction.update({ content: null, embeds: [embed], components: [] });

      await sendModLog(interaction.guild, {
        action: 'Adicionar Cargo',
        target: target.user,
        moderator: interaction.user,
        reason: 'Via Context Menu',
        extraFields: [
          { name: 'Cargo Atribuído', value: cargo.name, inline: true }
        ]
      });

    } catch (error) {
      console.error('[addRoleSelect] Erro ao adicionar cargo:', error);
      return interaction.update({
        content: 'Erro ao adicionar o cargo.',
        components: [],
        ephemeral: true
      });
    }
  }
};
