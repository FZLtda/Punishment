const { EmbedBuilder } = require('discord.js');
const { logModerationAction } = require('@utils/moderationUtils');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'removerole',
  description: 'Remove um cargo de um membro.',
  usage: '${currentPrefix}removerole <@membro> <@cargo>',
  userPermissions: ['ManageRoles'],
  botPermissions: ['ManageRoles'],
  deleteMessage: true,
  
  async execute(message) {

    const member = message.mentions.members.first();
    const role = message.mentions.roles.first();

    if (!member || !role) {
      const embedErroMinimo = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Argumentos inválidos. O formato correto do comando é: removerole @membro @cargo',
          iconURL: emojis.icon_attention
        });

      return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    if (!member.roles.cache.has(role.id)) {
      const embedErroMinimo = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Este usuário não possui este cargo.',
          iconURL: emojis.icon_attention
        });

      return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }

    try {
      await member.roles.remove(role);

      logModerationAction(
        message.guild.id,
        message.author.id,
        'RemoveRole',
        member.id,
        `Cargo removido: ${role.name}`
      );

      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(colors.red)
            .setTitle('<:Removido:1355700154593710080> Cargo Removido')
            .setDescription(`O cargo ${role} foi removido de ${member}.`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp()
        ], allowedMentions: { repliedUser: false } });

    } catch (error) {
      console.error(error);
      const embedErroMinimo = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Não foi possível remover o cargo.',
          iconURL: emojis.icon_attention
        });

      return message.reply({ embeds: [embedErroMinimo], allowedMentions: { repliedUser: false } });
    }
  }
};
