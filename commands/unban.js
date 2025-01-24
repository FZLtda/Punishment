const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { logModerationAction } = require('../moderationUtils');

module.exports = {
  name: 'unban',
  description: 'Desbane um membro do servidor.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply('<:no:1122370713932795997> Você não tem permissão para usar este comando.');
    }

    const userId = args[0];
    const motivo = args.slice(1).join(' ') || 'Não especificado.';

    if (!userId) {
      return message.reply('<:no:1122370713932795997> Você precisa fornecer o ID do usuário para desbanir.');
    }

    try {
      const user = await message.guild.bans.fetch(userId).catch(() => null);

      if (!user) {
        return message.reply('<:no:1122370713932795997> Este ID não pertence a um usuário banido.');
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
        .setTitle('<:emoji_48:1207522369426423808> Punição revogada')
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
      return message.reply('<:no:1122370713932795997> Ocorreu um erro ao tentar desbanir o usuário.');
    }
  },
};