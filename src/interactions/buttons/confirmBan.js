module.exports = {
  customId: 'confirm_ban',

  async execute(interaction, client) {
    const targetId = interaction.message.embeds?.[0]?.footer?.text;
    const member = await interaction.guild.members.fetch(targetId).catch(() => null);

    if (!member) {
      return interaction.reply({ content: 'Usuário não encontrado.', ephemeral: true });
    }

    try {
      await member.ban({ reason: `Banido por ${interaction.user.tag} via botão.` });
      await interaction.update({ content: `✅ ${member.user.tag} foi banido com sucesso.`, components: [], embeds: [] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Erro ao banir o usuário.', ephemeral: true });
    }
  }
};
