const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { logModerationAction } = require('../utils/moderationUtils');

module.exports = {
  name: 'mute',
  description: 'Aplica um timeout (mute) em um membro.',
  usage: '${currentPrefix}mute <@usuário> <duração> [motivo]',
  permissions: 'Moderar Membros',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Você não possui permissão para usar este comando.',
          iconURL: 'https://bit.ly/43PItSI'
      });

  return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    const membro = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const tempo = args[1];
    const motivo = args.slice(2).join(' ') || 'Não especificado.';

    if (!membro) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Mencione um usuário para executar esta ação.',
          iconURL: 'https://bit.ly/43PItSI'
      });

  return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    if (!tempo) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Defina um tempo de duração para prosseguir (ex.: 1m, 1h, 1d).',
          iconURL: 'https://bit.ly/43PItSI'
      });

  return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    const duracao = convertToMilliseconds(tempo);
    if (!duracao) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Duração inválida. Forneça um valor válido (ex.: 1m, 1h, 1d).',
          iconURL: 'https://bit.ly/43PItSI'
      });

  return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    if (!membro.moderatable) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Este usuário não pode ser silenciado devido às suas permissões.',
          iconURL: 'https://bit.ly/43PItSI'
      });

  return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    try {
      await membro.timeout(duracao, motivo);

      logModerationAction(message.guild.id, message.author.id, 'Mute', membro.id, motivo);

      const embed = new EmbedBuilder()
        .setTitle('<:1000046494:1340401256392298536> Punição aplicada')
        .setColor('Red')
        .setDescription(`${membro} (\`${membro.id}\`) foi mutado(a)!`)
        .addFields(
          { name: 'Duração', value: `\`${tempo}\``, inline: true },
          { name: 'Motivo', value: `\`${motivo}\``, inline: true }
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
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Não foi possível silenciar o usuário devido a um erro.',
          iconURL: 'https://bit.ly/43PItSI'
      });

  return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
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
