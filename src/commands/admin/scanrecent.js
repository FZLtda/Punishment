const { EmbedBuilder } = require('discord.js');
const { yellow } = require('../../config/colors.json');
const { icon_attention } = require('../../config/emoji.json');

module.exports = {
  name: 'scanrecent',
  description: 'Escaneia as últimas mensagens e mostra estatísticas simples do canal.',
  usage: '${currentPrefix}scanrecent',
  userPermissions: ['ManageMessages'],
  botPermissions: ['ReadMessageHistory'],
  deleteMessage: true,

  async execute(message) {
    try {
      const messages = await message.channel.messages.fetch({ limit: 100 });
      const userCount = {};
      let links = 0;
      let mentions = 0;
      let attachments = 0;

      messages.forEach(msg => {
        userCount[msg.author.tag] = (userCount[msg.author.tag] || 0) + 1;
        if (msg.content.includes('http://') || msg.content.includes('https://')) links++;
        if (msg.mentions.users.size > 0) mentions++;
        if (msg.attachments.size > 0) attachments++;
      });

      const topUsers = Object.entries(userCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([user, count], i) => `**${i + 1}.** ${user} — \`${count} msg\``)
        .join('\n');

      const embed = new EmbedBuilder()
        .setColor('#00AAFF')
        .setTitle('📊 Análise das últimas 100 mensagens')
        .addFields(
          { name: '👤 Top 5 usuários', value: topUsers || 'Nenhum usuário encontrado.', inline: false },
          { name: '🔗 Links encontrados', value: `${links}`, inline: true },
          { name: '👥 Menções', value: `${mentions}`, inline: true },
          { name: '📎 Anexos', value: `${attachments}`, inline: true }
        )
        .setFooter({ text: `Análise feita por ${message.author.tag}` })
        .setTimestamp();

      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

    } catch (error) {
      console.error(error);
      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Erro ao escanear as mensagens.',
          iconURL: icon_attention
        });
      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  }
};
