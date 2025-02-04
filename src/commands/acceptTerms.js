const fs = require('fs');
const path = require('path');

const acceptedUsersPath = path.resolve(__dirname, '../../data/acceptedUsers.json');

if (!fs.existsSync(acceptedUsersPath)) {
  fs.mkdirSync(path.dirname(acceptedUsersPath), { recursive: true });
  fs.writeFileSync(acceptedUsersPath, JSON.stringify([]));
}

module.exports = {
  name: 'acceptTerms',
  description: 'Aceitação de Termos de Uso.',
  execute: async (interaction) => {
    const acceptedUsers = JSON.parse(fs.readFileSync(acceptedUsersPath, 'utf8'));

    if (acceptedUsers.includes(interaction.user.id)) {
      return interaction.reply({
        content: '<:1000042883:1336044555354771638> Você já aceitou os termos anteriormente.',
        ephemeral: true,
      });
    }

    acceptedUsers.push(interaction.user.id);
    fs.writeFileSync(acceptedUsersPath, JSON.stringify(acceptedUsers, null, 4));

    return interaction.reply({
      content: '<:1000042885:1336044571125354496> Termos aceitos! Agora você pode usar o Punishment.',
      ephemeral: true,
    });
  },
};
