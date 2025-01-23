const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'mute',
  description: 'Aplica um timeout (mute) em um membro.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply('<:no:1122370713932795997> Você não tem permissão para usar este comando.');
    }

    const membro = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const tempo = args[1];
    const motivo = args.slice(2).join(' ') || 'Não especificado.';

    if (!membro) {
      return message.reply('<:no:1122370713932795997> Você precisa mencionar um membro ou fornecer o ID.');
    }

    if (!tempo) {
      return message.reply('<:no:1122370713932795997> Você precisa especificar um tempo de duração (ex.: 1m, 1h, 1d).');
    }

    const duracao = convertToMilliseconds(tempo);
    if (!duracao) {
      return message.reply('<:no:1122370713932795997> Por favor, forneça uma duração válida (ex.: 1m, 1h, 1d).');
    }

    if (!membro.moderatable) {
      return message.reply('<:no:1122370713932795997> Não é possível aplicar mute nesse membro.');
    }

    try {
      await membro.timeout(duracao, motivo);

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
          text: `${message.author.displayName}`,
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