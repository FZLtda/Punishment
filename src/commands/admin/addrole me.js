const { EmbedBuilder } = require('discord.js');
const { logModerationAction } = require('../../utils/moderationUtils');
const { yellow } = require('../../config/colors.json');
const { icon_attention } = require('../../config/emoji.json');

module.exports = {
  name: 'addroleme',
  description: 'Adiciona um cargo a você mesmo (exclusivo para o dono).',
  usage: '${currentPrefix}addroleme <@cargo>',
  userPermissions: [],
  botPermissions: ['ManageRoles'],
  deleteMessage: true,

  async execute(message) {
    const ownerId = '1006909671908585586';

    if (message.author.id !== ownerId) {
      const embedErro = new EmbedBuilder()
        .setColor(`${yellow}`)
        .setAuthor({
          name: 'Apenas o proprietário do bot pode usar este comando.',
          iconURL: `${icon_attention}`,
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    const role = message.mentions.roles.first();

    if (!role) {
      const embedErro = new EmbedBuilder()
        .setColor(`${yellow}`)
        .setAuthor({
          name: 'Você precisa mencionar um cargo válido.',
          iconURL: `${icon_attention}`,
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    if (role.position >= message.guild.members.me.roles.highest.position) {
      const embedErro = new EmbedBuilder()
        .setColor(`${yellow}`)
        .setAuthor({
          name: 'Não tenho permissão para adicionar este cargo, pois ele está acima do meu cargo mais alto.',
          iconURL: `${icon_attention}`,
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    if (message.member.roles.cache.has(role.id)) {
      const embedErro = new EmbedBuilder()
        .setColor(`${yellow}`)
        .setAuthor({
          name: 'Você já possui este cargo.',
          iconURL: `${icon_attention}`,
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    try {
      await message.member.roles.add(role);

      logModerationAction(
        message.guild.id,
        message.author.id,
        'AddRoleMe',
        message.author.id,
        `Cargo adicionado: ${role.name}`
      );

      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor('Green')
            .setTitle('<:Adicionado:1355700382642208948> Cargo Adicionado')
            .setDescription(`O cargo ${role} foi adicionado a você.`)
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setTimestamp()
        ],
        allowedMentions: { repliedUser: false }
      });

    } catch (error) {
      console.error(error);

      const embedErro = new EmbedBuilder()
        .setColor(`${yellow}`)
        .setAuthor({
          name: 'Não foi possível adicionar o cargo.',
          iconURL: `${icon_attention}`,
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  }
};
