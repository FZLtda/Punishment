'use strict';

const { ApplicationCommandType, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  name: 'Adicionar Cargo',
  type: ApplicationCommandType.User,
  default_member_permissions: 'ManageRoles',

  async execute(interaction) {
    const target = interaction.targetMember;
    const executor = interaction.member;

    // Verificação básica
    if (!interaction.guild.members.me.permissions.has('ManageRoles')) {
      return interaction.reply({ ephemeral: true, content: 'Não tenho permissão para gerenciar cargos.' });
    }

    // Filtrar apenas cargos que o bot pode gerenciar
    const cargosGerenciaveis = interaction.guild.roles.cache
      .filter(role => role.editable && role.id !== interaction.guild.id)
      .map(role => ({
        label: role.name,
        value: role.id
      }))
      .slice(0, 25);

    if (cargosGerenciaveis.length === 0) {
      return interaction.reply({ ephemeral: true, content: 'Nenhum cargo gerenciável disponível para atribuir.' });
    }

    const menu = new StringSelectMenuBuilder()
      .setCustomId(`addRoleSelect:${target.id}`)
      .setPlaceholder('Selecione o cargo para adicionar')
      .addOptions(cargosGerenciaveis);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      ephemeral: true,
      content: `Selecione o cargo que deseja adicionar para ${target.user.tag}:`,
      components: [row]
    });
  }
};
