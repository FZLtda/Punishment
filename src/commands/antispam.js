const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = './data/antispam.json';

if (!fs.existsSync(path)) {
  fs.writeFileSync(path, JSON.stringify({}));
}

const messageCounts = new Map();

module.exports = {
  name: 'antispam',
  description: 'Ativa ou desativa o sistema de bloqueio de spam no servidor.',
  usage: '${currentPrefix}antispam [on/off]',
  permissions: 'Gerenciar Mensagens',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Você não possui permissão para usar este comando.',
          iconURL: 'https://bit.ly/43PItSI'
      });

  return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    const option = args[0]?.toLowerCase();
    const guildId = message.guild.id;

    if (!['on', 'off'].includes(option)) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Uso incorreto! Use `.antispam on` para ativar ou `.antispam off` para desativar o sistema de bloqueio de spam.',
          iconURL: 'https://bit.ly/43PItSI'
      });

  return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    const settings = JSON.parse(fs.readFileSync(path, 'utf8'));

    if (option === 'on') {
      settings[guildId] = { enabled: true };
      fs.writeFileSync(path, JSON.stringify(settings, null, 4));

      const embed = new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle('<:on:1232142357848260639> Antispam Ativado')
        .setDescription('O sistema de bloqueio de spam foi ativado neste servidor.')
        .setFooter({
          text: `${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }

    if (option === 'off') {
      delete settings[guildId];
      fs.writeFileSync(path, JSON.stringify(settings, null, 4));

      const embed = new EmbedBuilder()
        .setColor('#fe3838')
        .setTitle('<:emoji_51:1248416468819906721> Antispam Desativado')
        .setDescription('O sistema de bloqueio de spam foi desativado neste servidor.')
        .setFooter({
          text: `${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
  },

  startAntispamListener(client) {
    client.on('messageCreate', async (message) => {
      const settings = JSON.parse(fs.readFileSync(path, 'utf8'));
      const isAntispamEnabled = settings[message.guild?.id]?.enabled;

      if (!isAntispamEnabled || !message.guild || message.author.bot) return;

      if (message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return;

      const guildId = message.guild.id;
      const authorId = message.author.id;
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
        try {
          await message.delete();

          const warning = await message.channel.send(
            `<:no:1122370713932795997> ${message.author}, você está enviando mensagens muito rápido.`
          );

          setTimeout(() => warning.delete().catch(() => null), 5000);

          await message.member.timeout(10 * 60 * 1000, 'Spam detectado pelo sistema de antispam.');

          const embed = new EmbedBuilder()
            .setColor('#fe3838')
            .setTitle('Antispam: Usuário Mutado')
            .setDescription(
              `Usuário **${message.author.tag}** foi mutado automaticamente por spam.`
            )
            .setFooter({
              text: `Detectado por: ${client.user.tag}`,
              iconURL: client.user.displayAvatarURL(),
            })
            .setTimestamp();

          message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
        } catch (error) {
          console.error('Erro ao processar antispam:', error);
        }
      }
    });
  },
};
