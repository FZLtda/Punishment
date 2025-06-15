const { EmbedBuilder } = require('discord.js');
const { yellow } = require('../../config/colors.json');
const { icon_attention } = require('../../config/emoji.json');

module.exports = {
  name: 'predict',
  description: 'Analisa mensagens recentes e tenta prever comportamentos suspeitos.',
  usage: '${currentPrefix}predict',
  userPermissions: ['Administrator'],
  botPermissions: ['ReadMessageHistory'],
  deleteMessage: true,

  async execute(message) {

    if (message.author.id !== '1006909671908585586') return;
    
    try {
      const messages = await message.channel.messages.fetch({ limit: 100 });
      const userActivity = {};

      for (const msg of messages.values()) {
        const authorId = msg.author.id;
        if (!userActivity[authorId]) {
          userActivity[authorId] = { count: 0, repeated: 0, lastMessage: null };
        }

        const userData = userActivity[authorId];
        userData.count++;

        if (userData.lastMessage && userData.lastMessage === msg.content) {
          userData.repeated++;
        }

        userData.lastMessage = msg.content;
      }

      const suspects = Object.entries(userActivity)
        .filter(([_, data]) => data.repeated >= 3 || data.count >= 10)
        .map(([id, data]) => `• <@${id}> — \`${data.count} msgs / ${data.repeated} repetidas\``)
        .join('\n');

      const embed = new EmbedBuilder()
        .setColor('#fe3838')
        .setTitle('🧠 Análise Preditiva')
        .setDescription(suspects || 'Nenhum comportamento suspeito detectado.')
        .setFooter({
          text: `${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

    } catch (error) {
      console.error(error);
      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Erro ao executar o sistema preditivo.',
          iconURL: icon_attention
        });
      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  }
};
