module.exports = {
    name: 'interactionCreate',
    execute: async (interaction, client) => {
      if (interaction.isButton() && interaction.customId === 'accept_terms') {
        const command = client.commands.get('acceptTerms');
        if (command) {
          await command.execute(interaction);
        }
      }
    },
  };

  const db = require('../data/database');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const giveaway = db.prepare('SELECT * FROM giveaways WHERE message_id = ?').get(interaction.message.id);
    if (!giveaway) return interaction.reply({ content: 'Sorteio não encontrado!', ephemeral: true });

    let participants = JSON.parse(giveaway.participants);

    if (interaction.customId === 'participar') {
      if (participants.includes(interaction.user.id)) {
        return interaction.reply({ content: 'Você já está participando!', ephemeral: true });
      }

      participants.push(interaction.user.id);
      db.prepare('UPDATE giveaways SET participants = ? WHERE message_id = ?').run(JSON.stringify(participants), interaction.message.id);

      return interaction.reply({ content: '🎟 Você entrou no sorteio!', ephemeral: true });
    }

    if (interaction.customId === 'ver_participantes') {
      return interaction.reply({ content: `👥 Participantes: ${participants.length}`, ephemeral: true });
    }
  },
};
