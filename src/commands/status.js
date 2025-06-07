const { EmbedBuilder, ActivityType } = require('discord.js');
const { yellow } = require('../config/colors.json');
const { icon_attention } = require('../config/emoji.json');

module.exports = {
  name: 'status',
  description: 'Altera o status do bot.',
  usage: '${currentPrefix}status <tipo> <mensagem>',
  userPermissions: ['Administrator'],
  botPermissions: ['Administrator'],
  deleteMessage: true,

  async execute(message, args) {
    const tipo = args[0]?.toLowerCase();
    const mensagem = args.slice(1).join(' ');

    const tiposValidos = ['jogando', 'assistindo', 'ouvindo', 'transmitindo'];

    if (!tipo || !tiposValidos.includes(tipo)) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Tipo inválido. Use: jogando, assistindo, ouvindo ou transmitindo.',
          iconURL: 'https://bit.ly/43PItSI',
        });
      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    if (!mensagem) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Você precisa fornecer uma mensagem de status.',
          iconURL: 'https://bit.ly/43PItSI',
        });
      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    const atividades = {
      jogando: ActivityType.Playing,
      assistindo: ActivityType.Watching,
      ouvindo: ActivityType.Listening,
      transmitindo: ActivityType.Streaming,
    };

    try {
      if (tipo === 'transmitindo') {
        await message.client.user.setActivity(mensagem, {
          type: atividades[tipo],
          url: 'https://twitch.tv/funczero',
        });
      } else {
        await message.client.user.setActivity(mensagem, {
          type: atividades[tipo],
        });
      }

      const embedSucesso = new EmbedBuilder()
        .setColor('Green')
        .setTitle('✅ Status atualizado com sucesso!')
        .addFields(
          { name: 'Tipo', value: `\`${tipo}\``, inline: true },
          { name: 'Mensagem', value: `\`${mensagem}\``, inline: true }
        )
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embedSucesso] });
    } catch (err) {
      console.error(err);
      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Ocorreu um erro ao tentar alterar o status do bot.',
          iconURL: icon_attention,
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  },
};
