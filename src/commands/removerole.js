const { EmbedBuilder } = require('discord.js');
const { logModerationAction } = require('../utils/moderationUtils');

module.exports = {
  name: 'removerole',
  description: 'Remove um cargo de um membro.',
  usage: '.removerole <@membro> <@cargo>',
  permissions: ['ManageRoles'],
  async execute(message, args) {
    if (!message.member.permissions.has('ManageRoles')) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Você não possui permissão para usar este comando.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
    }

    const member = message.mentions.members.first();
    const role = message.mentions.roles.first();

    if (!member || !role) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Argumentos inválidos. O formato correto do comando é: removerole @membro @cargo',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
    }

    if (!member.roles.cache.has(role.id)) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Este usuário não possui este cargo.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
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

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('Red')
            .setTitle('<:emoji_31:1218690412802216039> Cargo Removido')
            .setDescription(`O cargo ${role} foi removido de ${member}.`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp()
        ]
      });
    } catch (error) {
      console.error(error);
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Não foi possível remover o cargo.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
    }
  }
};