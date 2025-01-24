const { EmbedBuilder } = require('discord.js');
const { logModerationAction } = require('../moderationUtils');

module.exports = {
  name: 'removerole',
  description: 'Remove um cargo de um membro.',
  usage: '.removerole <@membro> <@cargo>',
  permissions: ['ManageRoles'],
  async execute(message, args) {
    if (!message.member.permissions.has('ManageRoles')) {
      return message.reply('<:no:1122370713932795997> Você não tem permissão para usar este comando.');
    }

    const member = message.mentions.members.first();
    const role = message.mentions.roles.first();

    if (!member || !role) {
      return message.reply('<:no:1122370713932795997> Uso incorreto do comando. Use: `.removerole @membro @cargo`');
    }

    if (!member.roles.cache.has(role.id)) {
      return message.reply('<:no:1122370713932795997> O usuário não possui este cargo.');
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
      return message.reply('<:no:1122370713932795997> Erro ao tentar remover o cargo. Verifique minhas permissões.');
    }
  }
};