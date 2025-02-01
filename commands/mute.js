const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { logModerationAction } = require('../moderationUtils');

module.exports = {
  name: 'mute',
  description: 'Aplica um timeout (mute) em um membro.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Você não possui permissão para usar este comando.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
    }

    const membro = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const tempo = args[1];
    const motivo = args.slice(2).join(' ') || 'Não especificado.';

    if (!membro) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Mencione um usuário para executar esta ação.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
    }

    if (!tempo) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Defina um tempo de duração para prosseguir (ex.: 1m, 1h, 1d).',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
    }

    const duracao = convertToMilliseconds(tempo);
    if (!duracao) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Duração inválida. Forneça um valor válido (ex.: 1m, 1h, 1d).',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
    }

    if (!membro.moderatable) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Este usuário não pode ser silenciado devido às suas permissões.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
    }

    try {
      await membro.timeout(duracao, motivo);

      logModerationAction(message.guild.id, message.author.id, 'Mute', membro.id, motivo);

      const embed = new EmbedBuilder()
        .setTitle('<:mute:1207381613185339473> Punição aplicada')
        .setColor('Red')
        .setDescription(`${membro} (\`${membro.id}\`) foi mutado(a)!`)
        .addFields(
          { name: 'Duração', value: tempo, inline: true },
          { name: 'Motivo', value: motivo, inline: false }
        )
        .setThumbnail(membro.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return message.reply('<:no:1122370713932795997> Ocorreu um erro ao tentar aplicar o mute.');
    }
  },
};

function convertToMilliseconds(tempo) {
  const regex = /^(\d+)([smhd])$/;
  const match = tempo.match(regex);
  if (!match) return null;

  const valor = parseInt(match[1], 10);
  const unidade = match[2];

  switch (unidade) {
    case 's':
      return valor * 1000;
    case 'm':
      return valor * 60 * 1000;
    case 'h':
      return valor * 60 * 60 * 1000;
    case 'd':
      return valor * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
}