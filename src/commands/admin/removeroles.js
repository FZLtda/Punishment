'use strict';

const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { sendWarning } = require('@utils/embedWarning');
const Logger = require('@logger');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'removeroles',
  description: 'Remove todos os cargos de um usuário (exceto o cargo padrão).',
  usage: 'removeroles @usuário',
  category: 'Moderação',
  permissions: [PermissionFlagsBits.ManageRoles],
  botPermissions: [PermissionFlagsBits.ManageRoles],

  async execute(message) {
    const target = message.mentions.members.first();
    const botMember = message.guild.members.me;

    if (!target) {
      return sendWarning(
        message,
        'Você precisa mencionar o membro de quem os cargos serão removidos.'
      );
    }

    const removableRoles = target.roles.cache.filter(role =>
      role.id !== message.guild.id &&
      role.position < botMember.roles.highest.position
    );

    if (!removableRoles.size) {
      return sendWarning(
        message,
        'Nenhum cargo pode ser removido desse usuário.'
      );
    }

    try {
      await target.roles.remove(removableRoles);

      Logger.info(
        `[REMOVEROLES] ${message.author.tag} removeu ${removableRoles.size} cargo(s) de ${target.user.tag}`
      );

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.errorEmoji} Cargos removidos`)
        .setColor(colors.red)
        .setDescription(`${target} teve os seguintes cargos removidos:`)
        .addFields([
          {
            name: 'Cargos removidos',
            value: removableRoles.map(role => `• ${role}`).join('\n'),
          }
        ])
        .setFooter({
          text: `${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });

    } catch (error) {
      Logger.error(
        `[REMOVEROLES] Erro ao remover cargos: ${error.stack || error.message}`
      );

      return sendWarning(
        message,
        'Não foi possível remover os cargos do usuário.'
      );
    }
  },
};
