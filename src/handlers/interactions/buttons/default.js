const { check } = require('../../../config/emoji.json');
const Terms = require('../../../models/Terms');

module.exports = async function handleButtonInteraction(interaction, client) {
  if (interaction.customId === 'accept_terms') {
    const userId = interaction.user.id;

    try {
      // [Cria o registro se não existir (upsert)]
      await Terms.updateOne(
        { userId },
        { $setOnInsert: { acceptedAt: new Date() } },
        { upsert: true }
      );

      await interaction.update({
        content: `${check} **Termos de Uso** aceitos! O Punishment já está disponível para você.`,
        components: [],
        embeds: [],
      });

      setTimeout(async () => {
        try {
          const message = await interaction.fetchReply();
          if (message.deletable) await message.delete().catch(() => {});
        } catch (err) {
          // [Silenciar erros na deleção]
        }
      }, 5000);
    } catch (err) {
      console.error(`Erro ao salvar aceitação dos termos: ${err.message}`);
      await interaction.reply({
        ephemeral: true,
        content: ' Não foi possível processar sua solicitação.',
      });
    }

    return;
  }

  const { handleButtonInteraction } = require('../../buttonInteractionHandler');
  return await handleButtonInteraction(interaction, client);
};
