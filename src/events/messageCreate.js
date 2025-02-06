const fs = require('fs');
const path = require('path');
const { getPrefix, setPrefix } = require('../utils/prefixes');

// Verifica apenas se o arquivo acceptedUsers.json existe e o cria, caso contrário
const acceptedUsersPath = path.resolve(__dirname, '../data/acceptedUsers.json');
if (!fs.existsSync(acceptedUsersPath)) {
  fs.writeFileSync(acceptedUsersPath, JSON.stringify([]), { flag: 'wx' }); // Cria apenas se não existir
}

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    const prefix = getPrefix(message.guild.id);
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

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
            url: 'https://bit.ly/3WMYa93',
          },
          {
            type: 2,
            custom_id: 'accept_terms',
            label: 'Aceitar Termos',
            style: 3,
          },
        ],
      };

      const replyMessage = await message.reply({ embeds: [embed], components: [row] });

      // Listener para interação do botão
      client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;
        if (interaction.customId === 'accept_terms' && interaction.user.id === message.author.id) {
          setTimeout(() => {
            replyMessage.delete().catch(() => null); // Apaga a mensagem após 2 segundos
          }, 2000);
        }
      });

      return;
    }

    try {
      await command.execute(message, args, { setPrefix, getPrefix });
    } catch (error) {
      console.error(`[ERROR] Erro ao executar o comando "${commandName}":`, error);
      const embedErro = {
        color: 0xfe3838,
        author: {
          name: 'Não foi possível executar o comando devido a um erro.',
          icon_url: 'http://bit.ly/4aIyY9j',
        },
      };
      await message.reply({ embeds: [embedErro] });
    }
  },
};