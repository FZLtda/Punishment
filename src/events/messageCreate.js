const fs = require('fs');
const path = require('path');
const { getPrefix, setPrefix } = require('../utils/prefixes');
const { Configuration, OpenAIApi } = require('openai');

// 🔹 Configuração da OpenAI para moderação automática
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const acceptedUsersPath = path.resolve(__dirname, '../data/acceptedUsers.json');
if (!fs.existsSync(acceptedUsersPath)) {
  fs.writeFileSync(acceptedUsersPath, JSON.stringify([]), { flag: 'wx' });
}

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    const prefix = getPrefix(message.guild.id);
    if (!message.content.startsWith(prefix)) {
      // 🔹 Moderação automática com ChatGPT
      try {
        const response = await openai.createChatCompletion({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'Você é um moderador de mensagens no Discord. Se a mensagem contém linguagem ofensiva, spam ou links não permitidos, responda "Inapropriado". Caso contrário, responda "Apropriado".',
            },
            { role: 'user', content: message.content },
          ],
        });

        const result = response.data.choices[0].message.content.trim();

        if (result === 'Inapropriado') {
          await message.delete();
          await message.channel.send(
            `<@${message.author.id}>, sua mensagem foi removida por violar as regras.`
          );
          console.log(`[MODERAÇÃO] Mensagem deletada: "${message.content}"`);
          return;
        }
      } catch (error) {
        console.error('[ERROR] Falha ao analisar mensagem:', error);
      }
    }

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

      const filter = (interaction) =>
        interaction.isButton() &&
        interaction.customId === 'accept_terms' &&
        interaction.user.id === message.author.id;

      const collector = message.channel.createMessageComponentCollector({
        filter,
        time: 60000,
      });

      collector.on('collect', async (interaction) => {
        try {
          if (!acceptedUsers.includes(interaction.user.id)) {
            acceptedUsers.push(interaction.user.id);
            fs.writeFileSync(acceptedUsersPath, JSON.stringify(acceptedUsers, null, 2));

            await interaction.reply({
              content: ':1000042885: Você aceitou os Termos de Uso. Agora pode usar o Punishment!',
              ephemeral: true,
            });

            replyMessage.delete().catch(() => null);
          }
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
      await message.reply({ embeds: [embedErro] });
    }
  },
};
