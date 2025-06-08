const { EmbedBuilder } = require('discord.js');
const { logModerationAction } = require('../utils/moderationUtils');
const { yellow } = require('../config/colors.json');
const { icon_attention } = require('../config/emoji.json');

module.exports = {
  name: 'p',
  description: 'Silencia (timeout) o autor da mensagem respondida por 30 minutos.',
  usage: '${currentPrefix}mute-msg [motivo]',
  userPermissions: ['ModerateMembers'],
  botPermissions: ['ModerateMembers'],
  deleteMessage: true,

  async execute(message, args) {
    const resposta = message.reference;
    if (!resposta) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Responda a uma mensagem para executar este comando.',
          iconURL: 'https://bit.ly/43PItSI'
        });
      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    const mensagemOriginal = await message.channel.messages.fetch(resposta.messageId).catch(() => null);
    if (!mensagemOriginal) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Não foi possível localizar a mensagem original.',
          iconURL: 'https://bit.ly/43PItSI'
        });
      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    const membro = message.guild.members.cache.get(mensagemOriginal.author.id);
    const motivo = args.join(' ') || 'Não especificado.';
    const duracao = 30 * 60 * 1000;

    if (!membro) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Usuário não encontrado no servidor.',
          iconURL: 'https://bit.ly/43PItSI'
        });
      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    if (!membro.moderatable) {
      const embedErro = new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({
          name: 'Este usuário não pode ser silenciado devido às suas permissões.',
          iconURL: 'https://bit.ly/43PItSI'
        });
      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    try {
      await membro.timeout(duracao, motivo);
      logModerationAction(message.guild.id, message.author.id, 'Mute (resposta)', membro.id, motivo);

      const embedSucesso = new EmbedBuilder()
        .setTitle('<:Mutado:1355700779859574954> Punição aplicada')
        .setColor('Red')
        .setDescription(`${membro} (\`${membro.id}\`) foi mutado(a) por resposta!`)
        .addFields(
          { name: 'Duração', value: `\`30m\``, inline: true },
          { name: 'Motivo', value: `\`${motivo}\``, inline: true }
        )
        .setThumbnail(membro.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embedSucesso] });
    } catch (error) {
      console.error(error);
      const embedErro = new EmbedBuilder()
        .setColor(`${yellow}`)
        .setAuthor({
          name: 'Erro ao aplicar o mute.',
          iconURL: `${icon_attention}`,
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  },
};
