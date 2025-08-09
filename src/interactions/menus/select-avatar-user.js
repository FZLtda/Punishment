const { EmbedBuilder, ActionRowBuilder, UserSelectMenuBuilder } = require('discord.js');
const { colors } = require('@config');
const { sendWarning } = require('@embeds/embedWarning');

module.exports = {
  customId: 'select-avatar-user',

  /**
   * Executa a interação do select menu para mostrar o avatar do usuário selecionado
   * @param {import('discord.js').Interaction} interaction
   */
  async execute(interaction) {
    
    const commandUserId = interaction.message.interaction?.user?.id;

    if (commandUserId && interaction.user.id !== commandUserId) {
      return sendWarning(interaction, 'Somente quem executou o comando pode usar este menu.', true);
    }

    const selectedUser = interaction.users.first();

    if (!selectedUser) {
      return sendWarning(interaction, 'Usuário não encontrado.', true);
    }

    const guildMember = interaction.guild.members.cache.get(selectedUser.id);

    if (!guildMember) {
      return sendWarning(interaction, 'Usuário não encontrado no servidor.', true);
    }

    const avatarUrl = guildMember.displayAvatarURL({ dynamic: true, size: 1024 });

    const newEmbed = new EmbedBuilder()
      .setColor(colors.red)
      .setTitle(`Avatar de ${guildMember.displayName || guildMember.user.tag}`)
      .setImage(avatarUrl)
      .setFooter({
        text: `${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    const userSelectMenu = new UserSelectMenuBuilder()
      .setCustomId('select-avatar-user')
      .setPlaceholder('Selecione um usuário para ver o avatar');

    const row = new ActionRowBuilder().addComponents(userSelectMenu);

    await interaction.update({ embeds: [newEmbed], components: [row] });
  }
};
