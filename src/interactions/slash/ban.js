const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bane um membro do servidor.')
    .addUserOption(opt =>
      opt.setName('usuário')
        .setDescription('Membro a ser banido')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('motivo')
        .setDescription('Motivo do banimento')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('usuário');
    const reason = interaction.options.getString('motivo') || 'Não especificado';

    if (target.id === interaction.user.id) {
      return interaction.reply({ content: 'Você não pode se banir.', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      return interaction.reply({ content: 'Membro não encontrado no servidor.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('Confirmação de Banimento')
      .setDescription(`Deseja realmente banir **${target.tag}**?\n\n📝 **Motivo:** ${reason}`)
      .setColor('Red')
      .setFooter({ text: target.id })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('confirm_ban')
        .setLabel('Confirmar Ban')
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
};
