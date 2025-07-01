const { EmbedBuilder } = require('discord.js');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'mute',
  description: 'Aplica um timeout (mute) em um membro.',
  usage: '${currentPrefix}mute <@usuário> <duração> [motivo]',
  userPermissions: ['ModerateMembers'],
  botPermissions: ['ModerateMembers'],
  deleteMessage: true,

  async execute(message, args) {
    const membro = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const tempo = args[1];
    const motivo = args.slice(2).join(' ') || 'Não especificado.';

    if (!membro) return sendError(message, 'Mencione um usuário para executar esta ação.');
    if (!tempo) return sendError(message, 'Defina um tempo de duração para prosseguir (ex: 1m, 1h, 1d).');

    const duracao = convertToMilliseconds(tempo);
    if (!duracao) return sendError(message, 'Duração inválida. Forneça um valor válido (ex: 1m, 1h, 1d).');

    if (!membro.moderatable) return sendError(message, 'Este usuário não pode ser silenciado devido às suas permissões.');

    try {
      await membro.timeout(duracao, motivo);

      const embed = new EmbedBuilder()
        .setTitle('🔇 Usuário silenciado com sucesso')
        .setColor(colors.red)
        .setDescription(`${membro} (\`${membro.id}\`) foi silenciado.`)
        .addFields(
          { name: '⏳ Duração', value: `\`${tempo}\``, inline: true },
          { name: '📝 Motivo', value: `\`${motivo}\``, inline: true }
        )
        .setThumbnail(membro.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `Moderação por ${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return sendError(message, 'Não foi possível silenciar o usuário devido a um erro inesperado.');
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
    case 's': return valor * 1000;
    case 'm': return valor * 60 * 1000;
    case 'h': return valor * 60 * 60 * 1000;
    case 'd': return valor * 24 * 60 * 60 * 1000;
    default: return null;
  }
}

function sendError(message, texto) {
  const embed = new EmbedBuilder()
    .setColor(colors.warning || colors.yellow)
    .setAuthor({ name: texto, iconURL: emojis.icon_attention || null });

  return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
}
