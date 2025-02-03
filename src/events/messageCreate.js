const fs = require('fs');
const path = require('path');
const { getPrefix } = require('../utils/prefixes');


const acceptedUsersPath = path.resolve(__dirname, '../../data/acceptedUsers.json');


if (!fs.existsSync(acceptedUsersPath)) {
  fs.mkdirSync(path.dirname(acceptedUsersPath), { recursive: true });
  fs.writeFileSync(acceptedUsersPath, JSON.stringify([]));
}

module.exports = {
  name: 'messageCreate',

  async execute(message, client) {
   
    if (message.author.bot || !message.guild) return;

   
    const acceptedUsers = JSON.parse(fs.readFileSync(acceptedUsersPath, 'utf8'));

    
    if (!acceptedUsers.includes(message.author.id)) {
      const embed = {
        color: 0xfe3838,
        title: 'Termos de Uso',
        description:
          'Para continuar usando o **Punishment**, você precisa aceitar nossos **Termos de Uso**.\n\n' +
          'Clique no botão **"Ler Termos"** para visualizar os termos, ou clique em **"Aceitar Termos"** ' +
          'se você já leu e concorda com eles.',
        footer: { text: 'Obrigado por utilizar o Punishment!' },
      };

      const row = {
        type: 1,
        components: [
          {
            type: 2,
            label: 'Ler Termos',
            style: 5,
            url: 'https://bit.ly/3WMYa93', // Link para os termos
          },
          {
            type: 2,
            custom_id: 'accept_terms',
            label: 'Aceitar Termos',
            style: 3,
          },
        ],
      };

      await message.reply({ embeds: [embed], components: [row] });
      return;
    }

    
    const prefix = getPrefix(message.guild.id);

    
    if (!message.content.startsWith(prefix)) return;

   
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

   
    const command = client.commands.get(commandName);
    if (!command) return;

    
    try {
      await command.execute(message, args);
    } catch (error) {
      console.error(`[ERROR] Erro ao executar o comando "${commandName}":`, error);
      await message.reply(
        ':1000042883: Não foi possível executar o comando.'
      );
    }
  },
};
