const { EmbedBuilder } = require('discord.js');
const { logModerationAction } = require('../utils/moderationUtils');
const { yellow } = require('../config/colors.json');
const { icon_attention } = require('../config/emoji.json');

module.exports = {
  name: 'addrole',
  description: 'Adiciona um cargo a um membro.',
  usage: '${currentPrefix}addrole <@membro> <@cargo>',
  userPermissions: ['ManageRoles'],
  botPermissions: ['ManageRoles'],
  deleteMessage: true,

  async execute(message) {
    const member = message.mentions.members.first();
    const role = message.mentions.roles.first();

    if (!member || !role) {
      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Argumentos inválidos. O formato correto do comando é: .addrole @membro @cargo',
          iconURL: icon_attention,
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    if (role.position >= message.guild.members.me.roles.highest.position) {
      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Não tenho permissão para adicionar este cargo, pois ele está acima do meu cargo mais alto.',
          iconURL: icon_attention,
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    if (member.roles.cache.has(role.id)) {
      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Este usuário já possui este cargo.',
          iconURL: icon_attention,
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    try {
      await member.roles.add(role);

      logModerationAction(
        message.guild.id,
        message.author.id,
        'AddRole',
        member.id,
        `Cargo adicionado: ${role.name}`
      );

      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor('Green')
            .setTitle('<:Adicionado:1355700382642208948> Cargo Adicionado')
            .setDescription(`O cargo ${role} foi adicionado a ${member}.`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setTimestamp()
        ],
        allowedMentions: { repliedUser: false }
      });
    } catch (error) {
      console.error(error);
      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Não foi possível adicionar o cargo.',
          iconURL: icon_attention,
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  }
};
