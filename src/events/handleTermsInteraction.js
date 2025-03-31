async function handleTermsInteraction(interaction) {
    const userId = interaction.user.id;
  
    if (interaction.customId === 'accept_terms') {

      db.prepare('INSERT OR IGNORE INTO terms (user_id) VALUES (?)').run(userId);
  
      await interaction.update({
        content: 'Você aceitou os Termos de Uso. Agora pode usar o bot!',
        components: [],
        embeds: [],
      });
    } else if (interaction.customId === 'decline_terms') {
      await interaction.update({
        content: 'Você recusou os Termos de Uso. Não poderá usar o bot.',
        components: [],
        embeds: [],
      });
    } else {
        
      await interaction.reply({
        content: 'Ação inválida ou não reconhecida.',
        ephemeral: true,
      });
    }
  }