const db = require('../data/database');
const { getPrefix, setPrefix } = require('../utils/prefixes');
const { conversationHistory, fetchAIResponse } = require('../utils/aiHandler');
const customCommandHandler = require('../utils/customCommandHandler');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    // Verifica se a mensagem foi enviada em um tópico que começa com 'Punishment -'
    if (message.channel.isThread() && message.channel.name.startsWith('Punishment -')) {
      const userId = message.author.id;
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return;

      if (!conversationHistory[userId]) {
        conversationHistory[userId] = [];
      }

      conversationHistory[userId].push({ role: 'user', content: message.content });

      try {
        const response = await fetchAIResponse(conversationHistory[userId], apiKey);
        conversationHistory[userId].push({ role: 'assistant', content: response });

        // Envia a resposta da IA no tópico
        await message.channel.send(`\n${response}`);
      } catch (error) {
        console.error('Erro ao consultar a IA:', error);
        await message.channel.send('<:1000042883:1336044555354771638> Erro ao processar a resposta. Tente novamente mais tarde.');
      }
      return;
    }

    // Obtém o prefixo configurado para o servidor
    const prefix = getPrefix(message.guild.id);
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) {
      
      await customCommandHandler(message, prefix);
      return;
    }

    // Verifica se o usuário aceitou os Termos de Uso
    const userAccepted = db.prepare('SELECT user_id FROM accepted_users WHERE user_id = ?').get(message.author.id);
    console.log(`[DEBUG] Verificando usuário: ${message.author.id}, Resultado:`, userAccepted);

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
            url: 'https://docs.google.com/document/d/12-nG-vY0bhgIzsaO2moSHjh7QeCrQLSGd7W2XYDMXsk/mobilebasic',
          },
          {
            type: 2,
            custom_id: 'accept_terms',
            label: 'Aceitar Termos',
            style: 3,
          },
        ],
      };

      // Envia a mensagem para o usuário aceitar os Termos de Uso
      const replyMessage = await message.reply({ 
        embeds: [embed], 
        components: [row], 
        allowedMentions: { repliedUser: false } 
      });

      // Cria um coletor para o botão de Aceitar Termos
      const collector = message.channel.createMessageComponentCollector({
        filter: (interaction) =>
          interaction.isButton() &&
          interaction.customId === 'accept_terms' &&
          interaction.user.id === message.author.id,
        time: 60000,
      });

      collector.on('collect', async (interaction) => {
        try {
          // Registra o usuário que aceitou os Termos de Uso no banco de dados
          db.prepare('INSERT OR IGNORE INTO accepted_users (user_id) VALUES (?)').run(interaction.user.id);

          const checkUser = db.prepare('SELECT user_id FROM accepted_users WHERE user_id = ?').get(interaction.user.id);
          console.log(`[DEBUG] Usuário aceitou os termos:`, checkUser);

          // Responde que os Termos foram aceitos
          await interaction.reply({
            content: '<:1000042885:1336044571125354496> Você aceitou os Termos de Uso. Agora pode usar o Punishment!',
            ephemeral: true,
          });

          // Apaga a mensagem original
          await replyMessage.delete();
        } catch (error) {
          console.error('[ERROR] Erro ao aceitar os Termos de Uso:', error.message);
        }
      });

      return;
    }

    // Executa o comando, caso o usuário tenha aceitado os Termos de Uso
    try {
      await command.execute(message, args, { setPrefix, getPrefix });

      // Deleta a mensagem após 10ms
      setTimeout(() => {
        message.delete().catch(() => {});
      }, 10);
    } catch (error) {
      console.error(`[ERROR] Erro ao executar o comando "${commandName}":`, error);

      // Envia uma mensagem de erro caso o comando falhe
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
