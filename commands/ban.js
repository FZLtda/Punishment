const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'ban',
  description: 'Bane um membro do servidor.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply('<:no:1122370713932795997> Você não tem permissão para usar este comando.');
    }

    const membro = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const motivo = args.slice(1).join(' ') || 'Não especificado.';

    if (!membro) {
      return message.reply('<:no:1122370713932795997> Você precisa mencionar um membro ou fornecer o ID.');
    }

    if (!membro.bannable) {
      return message.reply('<:no:1122370713932795997> Não é possível banir este membro.');
    }

    try {
      await membro.ban({ reason: motivo });

      const embed = new EmbedBuilder()
        .setTitle('<:emoji_49:1207525971884900373> Punição aplicada')
        .setColor('Red')
        .setDescription(`${membro} (\`${membro.id}\`) foi banido(a)!`)
        .addFields(
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
      return message.reply('<:no:1122370713932795997> Ocorreu um erro ao tentar banir o membro.');
    }
  },
};