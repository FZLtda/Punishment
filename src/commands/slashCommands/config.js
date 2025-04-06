const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Abra o painel de configurações do Punishment.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('Painel de Configuração — Punishment')
      .setDescription('Selecione uma categoria abaixo para configurar.')
      .setColor('#2f3136')
      .setFooter({ text: `Servidor: ${interaction.guild.name}`, iconURL: interaction.guild.iconURL() });

    const select = new StringSelectMenuBuilder()
      .setCustomId('config-select')
      .setPlaceholder('Escolha uma categoria')
      .addOptions(
        { label: 'Prefixo', value: 'prefix' },
        { label: 'Boas-vindas', value: 'welcome' },
        { label: 'Sistema de Logs', value: 'logs' },
        { label: 'Anti-Nuke', value: 'antinuke' },
        { label: 'Tickets', value: 'tickets' },
        { label: 'Mensagens Automáticas', value: 'auto-msg' }
      );

    const row = new ActionRowBuilder().addComponents(select);

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
};
