const { check } = require('../../../config/emoji.json');
const db = require('../../../data/database');

module.exports = async function handleButtonInteraction(interaction, client) {
  if (interaction.customId === 'accept_terms') {
    const userId = interaction.user.id;
    db.prepare('INSERT OR IGNORE INTO terms (user_id) VALUES (?)').run(userId);

    await interaction.update({
      content: `${check} **Termos de Uso** aceitos! O Punishment já está disponível para você.`,
      components: [],
      embeds: [],
    });

    setTimeout(async () => {
      try {
        const message = await interaction.fetchReply();
        if (message.deletable) await message.delete().catch(() => {});
      } catch (err) {}
    }, 5000);
    return;
  }

  const { handleButtonInteraction } = require('../../buttonInteractionHandler');
  return await handleButtonInteraction(interaction, client, db);
};
