'use strict';

const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { sendWarning } = require('@utils/embedWarning');
const Logger = require('@logger');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'addroles',
  description: 'Adiciona múltiplos cargos a um usuário de uma vez.',
  usage: 'addroles @usuário @cargo1 @cargo2 ...',
  category: 'Moderação',
  permissions: [PermissionFlagsBits.ManageRoles],
  botPermissions: [PermissionFlagsBits.ManageRoles],

  async execute(message) {
    const target = message.mentions.members.first();
    const rolesToAdd = message.mentions.roles;

    if (!target) {
      return sendWarning(message, 'Você precisa mencionar o membro que receberá os cargos.');
    }

    if (!rolesToAdd.size) {
      return sendWarning(message, 'Você precisa mencionar pelo menos um cargo para adicionar.');
    }

    const botMember = message.guild.members.me;

    if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return sendWarning(message, 'Não tenho permissão para gerenciar cargos.');
    }

    const missing = [];

    const filteredRoles = rolesToAdd.filter(role => {
      if (target.roles.cache.has(role.id)) return false;
      if (role.position >= botMember.roles.highest.position) {
        missing.push(role.name);
        return false;
      }
      return true;
    });

    if (!filteredRoles.size) {
      return sendWarning(message, 'Nenhum cargo válido encontrado para adicionar.');
    }

    try {
      await target.roles.add(filteredRoles);

      Logger.info(
        `[ADDROLES] ${message.author.tag} adicionou ${filteredRoles.size} cargo(s) a ${target.user.tag}`
      );

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.successEmoji} Cargos adicionados`)
        .setColor(colors.green)
        .setDescription(`${target} recebeu os seguintes cargos:`)
        .addFields([
          {
            name: 'Cargos aplicados',
            value: filteredRoles.map(role => `• ${role}`).join('\n'),
          },
          ...(missing.length
            ? [{
                name: 'Ignorados (hierarquia)',
                value: missing.map(name => `• ${name}`).join('\n'),
              }]
            : []),
        ])
        .setFooter({
          text: `${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });

    } catch (error) {
      Logger.error(`[ADDROLES] Erro ao adicionar cargos: ${error.stack || error.message}`);
      return sendWarning(message, 'Não foi possível adicionar os cargos.');
    }
  },
};
