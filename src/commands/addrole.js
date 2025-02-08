const { logModerationAction } = require('../utils/moderationUtils');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'addrole',
  description: 'Adiciona um cargo a um membro.',
  usage: '${currentPrefix}addrole <@membro> <@cargo>',
  permissions: 'ManageRoles',
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
          name: 'Argumentos inválidos. O formato correto do comando é: addrole @membro @cargo',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
    }

    if (role.position >= message.guild.members.me.roles.highest.position) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Não tenho permissão para adicionar este cargo, pois ele está acima do meu cargo mais alto.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
    }

    if (member.roles.cache.has(role.id)) {
      const embedErroMinimo = new EmbedBuilder()
      .setColor('#FF4C4C')
      .setAuthor({
          name: 'Este usuário já possui este cargo.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
    }

    try {
      await member.roles.add(role);

      logModerationAction(message.guild.id,message.author.id, 'AddRole', member.id, `Cargo adicionado: ${role.name}`);

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('Green')
            .setTitle('<:emoji_46:1236675567496069120> Cargo Adicionado')
            .setDescription(`O cargo ${role} foi adicionado a ${member}.`)
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
          name: 'Não foi possível adicionar o cargo.',
          iconURL: 'http://bit.ly/4aIyY9j'
      });

  return message.reply({ embeds: [embedErroMinimo] });
    }
  }
};
