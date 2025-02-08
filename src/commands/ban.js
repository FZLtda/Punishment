const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { logModerationAction } = require('../utils/moderationUtils');

module.exports = {
  name: 'ban',
  description: 'Bane um membro do servidor.',
  usage: '${currentPrefix}ban <@usuário> [motivo]',
  permissions: 'Banir Membros',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Você não possui permissão para usar este comando.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
    }

    const membro = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const motivo = args.slice(1).join(' ') || 'Não especificado.';

    if (!membro) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Mencione um usuário para executar esta ação.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
    }

    if (!membro.bannable) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Este usuário não pode ser banido devido às suas permissões.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
    }

    try {
      await membro.ban({ reason: motivo });

      logModerationAction(message.guild.id, message.author.id, 'Ban', membro.id, motivo);

      const embed = new EmbedBuilder()
        .setTitle('<:emoji_49:1207525971884900373> Punição aplicada')
        .setColor('Red')
        .setDescription(`${membro} (\`${membro.id}\`) foi banido(a)!`)
        .addFields(
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
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Não foi possível banir o usuário devido a um erro.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
    }
  },
};
