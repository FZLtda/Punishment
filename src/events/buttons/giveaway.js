const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../data/database');

async function participar(interaction) {
  const giveaway = db.prepare('SELECT * FROM giveaways WHERE message_id = ?').get(interaction.message.id);
  if (!giveaway) return;

  let participants = JSON.parse(giveaway.participants);
  if (participants.includes(interaction.user.id)) {
    return interaction.reply({
      content: '<:1000042883:1336044555354771638> Você já está concorrendo neste sorteio!',
      ephemeral: true
    });
  }

  participants.push(interaction.user.id);
  db.prepare('UPDATE giveaways SET participants = ? WHERE message_id = ?')
    .run(JSON.stringify(participants), interaction.message.id);

  const updatedRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('participar')
      .setLabel('🎟 Participar')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('ver_participantes')
      .setLabel(`👥 Participantes: ${participants.length}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true)
  );

  await interaction.update({ components: [updatedRow] });
  return interaction.followUp({
    content: '<:1000042885:1336044571125354496> Sua entrada no sorteio foi registrada!',
    ephemeral: true
  });
}

async function verParticipantes(interaction) {
  const giveaway = db.prepare('SELECT * FROM giveaways WHERE message_id = ?').get(interaction.message.id);
  if (!giveaway) return;

  let participants = JSON.parse(giveaway.participants);

  return interaction.reply({
    content: `👥 Participantes: ${participants.length}`,
    ephemeral: true
  });
}

module.exports = { participar, verParticipantes };
