const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { logModerationAction } = require('../utils/moderationUtils');

module.exports = {
  name: 'unban',
  description: 'Desbane um membro do servidor.',
  usage: '${currentPrefix}unban <ID>',
  permissions: 'Banir Membros',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Você não possui permissão para usar este comando.',
          iconURL: 'https://bit.ly/43PItSI'
      });

  return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    const userId = args[0];
    const motivo = args.slice(1).join(' ') || 'Não especificado.';

    if (!userId) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Você precisa fornecer o ID do usuário para desbanir.',
          iconURL: 'https://bit.ly/43PItSI'
      });

  return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    try {
      const user = await message.guild.bans.fetch(userId).catch(() => null);

      if (!user) {
        const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Não há registro de banimento para este usuário.',
          iconURL: 'https://bit.ly/43PItSI'
      });

  return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
      }

      await message.guild.members.unban(userId, motivo);

      logModerationAction(
        message.guild.id,
        message.author.id,
        'Unban',
        userId,
        motivo
      );

      const embed = new EmbedBuilder()
        .setTitle('<:Desbanido:1355718942076965016> Punição revogada')
        .setColor('Green')
        .setDescription(`<@${userId}> (\`${userId}\`) foi desbanido(a)!`)
        .addFields(
          { name: 'Motivo', value: motivo, inline: false }
        )
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
          name: 'Não foi possível desbanir o usuário devido a um erro.',
          iconURL: 'https://bit.ly/43PItSI'
      });

  return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }
  },
};
