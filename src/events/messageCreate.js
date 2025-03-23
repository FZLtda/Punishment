const db = require('../data/database');
const fs = require('fs');
const path = './data/antilink.json';
const pathAntispam = './data/antispam.json';
const pathAntinuke = './data/antinuke.json';
const { getPrefix, setPrefix } = require('../utils/prefixes');
const { conversationHistory, fetchAIResponse } = require('../utils/aiHandler');
const { Events, PermissionsBitField } = require('discord.js');

const messageCounts = new Map();

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    // Carregar configurações do Anti-Nuke
    let antinukeSettings;
    try {
      antinukeSettings = JSON.parse(fs.readFileSync(pathAntinuke, 'utf8'));
    } catch (error) {
      antinukeSettings = {};
      fs.writeFileSync(pathAntinuke, JSON.stringify({}, null, 4));
    }

    const isAntinukeEnabled = antinukeSettings[message.guild.id]?.enabled;
    if (isAntinukeEnabled) {
      require('../events/antinukeHandler')(client);
    }
    
    // Sistema de Resposta da IA em Threads "Punishment -"
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

        await message.channel.send(`\n${response}`);
      } catch (error) {
        console.error('Erro ao consultar a IA:', error);
        await message.channel.send('<:1000042883:1336044555354771638> Erro ao processar a resposta. Tente novamente mais tarde.');
      }
      return;
    }

    // Sistema de Antilink
    let settings;
    try {
      settings = JSON.parse(fs.readFileSync(path, 'utf8'));
    } catch (error) {
      settings = {};
      fs.writeFileSync(path, JSON.stringify({}, null, 4));
    }

    const isAntilinkEnabled = settings[message.guild.id]?.enabled;
    if (isAntilinkEnabled) {
      const linkRegex = /(https?:\/\/|www\.)\S+/gi;
      if (linkRegex.test(message.content)) {
        if (message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return;

        try {
          await message.delete();
          const reply = await message.channel.send(
            `<:1000042883:1336044555354771638> ${message.author}, links não são permitidos neste servidor.`
          );

          setTimeout(() => reply.delete().catch(() => null), 5000);
        } catch (error) {
          console.error('Erro ao excluir a mensagem:', error);
        }
        return;
      }
    }

    // Sistema de Antispam
    if (fs.existsSync(pathAntispam)) {
      const antispamSettings = JSON.parse(fs.readFileSync(pathAntispam, 'utf8'));
      const guildId = message.guild.id;
      const authorId = message.author.id;
      const member = message.member;

      const isAntispamEnabled = antispamSettings[guildId]?.enabled;

      if (isAntispamEnabled) {
        const key = `${guildId}-${authorId}`;

        if (!messageCounts.has(key)) {
          messageCounts.set(key, { count: 0, timestamp: Date.now() });
        }

        const userData = messageCounts.get(key);
        const timeSinceFirstMessage = Date.now() - userData.timestamp;

        if (timeSinceFirstMessage > 10000) {
          userData.count = 0;
          userData.timestamp = Date.now();
        }

        userData.count++;

        const SPAM_LIMIT = 5;

        if (userData.count > SPAM_LIMIT) {
          if (member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return;

          try {
            await message.delete();

            const warning = await message.channel.send(
              `<:no:1122370713932795997> ${message.author}, você está enviando mensagens muito rápido.`
            );

            setTimeout(() => warning.delete().catch(() => null), 5000);

            await member.timeout(10 * 60 * 1000, 'Spam detectado pelo sistema de antispam.');

            const embed = {
              color: 0xfe3838,
              title: '<:1000046494:1340401256392298536> Punição aplicada',
              description: `${message.author} (\`${message.author.id}\`) foi mutado(a) automaticamente por spam.`,
              footer: {
                text: `${client.user.tag}`,
                icon_url: client.user.displayAvatarURL(),
              },
              timestamp: new Date(),
            };

            message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
          } catch (error) {
            console.error('Erro ao processar antispam:', error);
          }
        }
      }
    }

    // Sistema de Prefixo e Comandos
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

      setTimeout(() => {
        message.delete().catch(() => {});
      }, 10);
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
