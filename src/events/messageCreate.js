const db = require('../data/database');
const { getPrefix, setPrefix } = require('../utils/prefixes');

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

    const userAccepted = db.prepare('SELECT user_id FROM accepted_users WHERE user_id = ?').get(message.author.id);

    if (!userAccepted) {
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

      const replyMessage = await message.reply({ embeds: [embed], components: [row], allowedMentions: { repliedUser: false } });

      const collector = message.channel.createMessageComponentCollector({
        filter: (interaction) =>
          interaction.isButton() &&
          interaction.customId === 'accept_terms' &&
          interaction.user.id === message.author.id,
        time: 60000,
      });

      collector.on('collect', async (interaction) => {
        try {
          
          db.prepare('INSERT INTO accepted_users (user_id) VALUES (?)').run(interaction.user.id);

          await interaction.reply({
            content: '<:1000042885:1336044571125354496> Você aceitou os Termos de Uso. Agora pode usar o Punishment!',
            ephemeral: true,
          });

          replyMessage.delete().catch(() => null);
        } catch (error) {
          console.error('[ERROR] Erro ao aceitar os Termos de Uso:', error.message);
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

      await message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  },
};
