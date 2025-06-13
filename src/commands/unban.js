const { EmbedBuilder } = require('discord.js');
const { logModerationAction } = require('../utils/moderationUtils');
const { yellow, green } = require('../config/colors.json');
const { icon_attention } = require('../config/emoji.json');

module.exports = {
  name: 'unban',
  description: 'Desbane um membro do servidor.',
  usage: '${currentPrefix}unban <ID>',
  userPermissions: ['BanMembers'],
  botPermissions: ['BanMembers'],
  deleteMessage: true,
  
  async execute(message, args) {

    const userId = args[0];
    const motivo = args.slice(1).join(' ') || 'Não especificado.';

    if (!userId) {
      const embedErroMinimo = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Você precisa fornecer o ID do usuário para desbanir.',
          iconURL: icon_attention
        });

      return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    try {
      const user = await message.guild.bans.fetch(userId).catch(() => null);

      if (!user) {
        const embedErroMinimo = new EmbedBuilder()
          .setColor(yellow)
          .setAuthor({
            name: 'Não há registro de banimento para este usuário.',
            iconURL: icon_attention
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
        .setColor(green)
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
        .setColor(yellow)
        .setAuthor({
          name: 'Não foi possível desbanir o usuário devido a um erro.',
          iconURL: icon_attention
        });

      return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }
  },
};
