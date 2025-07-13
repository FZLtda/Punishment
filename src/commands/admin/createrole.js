'use strict';

/**
 * Cria um cargo personalizado com nome, cor, posição, permissões e opção de ser mencionável.
 * Suporta cores nomeadas ou hexadecimais e permissões em UPPER_CASE.
 */

const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { colors } = require('@config');
const { sendEmbed } = require('@utils/embedReply');

const NAMED_COLORS = Object.freeze({
  RED: '#ff0000',
  GREEN: '#00ff00',
  BLUE: '#3498db',
  YELLOW: '#ffff00',
  PURPLE: '#9b59b6',
  ORANGE: '#e67e22',
  PINK: '#ff69b4',
  WHITE: '#ffffff',
  BLACK: '#000000',
  GRAY: '#95a5a6'
});

module.exports = {
  name: 'createrole',
  description: 'Cria um novo cargo com configurações avançadas.',
  usage: '${currentPrefix}createrole <nome> [--cor <hex|nome>] [--men <true|false>] [--perms <PERM1,PERM2>] [--pos <número>]',
  category: 'Administração',
  userPermissions: ['ManageRoles'],
  botPermissions: ['ManageRoles'],
  deleteMessage: true,

  async execute(message, args) {
    const input = args.join(' ');
    const regex = /^(?<name>.+?)(?:\s--cor\s(?<color>\S+))?(?:\s--men\s(?<mentionable>true|false))?(?:\s--perms\s(?<perms>[A-Z_,]+))?(?:\s--pos\s(?<pos>\d+))?$/i;
    const match = input.match(regex)?.groups || {};

    const name = match.name?.trim();
    if (!name)
      return sendEmbed('yellow', message, 'Você deve fornecer um nome para o cargo.');

    let color = match.color;
    if (color) {
      color = color.toUpperCase();
      if (NAMED_COLORS[color]) {
        color = NAMED_COLORS[color];
      } else if (!/^#?[0-9A-F]{6}$/i.test(color)) {
        return sendEmbed('yellow', message, 'Cor inválida. Use hexadecimal ou cores nomeadas como RED, GREEN, etc.');
      }
    }

    const mentionable = match.mentionable === 'true';
    const position = match.pos ? parseInt(match.pos, 10) : undefined;

    const permissions = [];
    if (match.perms) {
      for (const rawPerm of match.perms.split(',').map(p => p.trim())) {
        const camelPerm = rawPerm
          .toLowerCase()
          .replace(/_(.)/g, (_, c) => c.toUpperCase())
          .replace(/^./, c => c.toUpperCase());

        if (PermissionsBitField.Flags[camelPerm]) {
          permissions.push(camelPerm);
        } else {
          console.warn(`[createrole] Permissão inválida ignorada: ${rawPerm}`);
        }
      }
    }

    try {
      const role = await message.guild.roles.create({
        name,
        color,
        mentionable,
        permissions: permissions.length ? new PermissionsBitField(permissions) : undefined,
        reason: `Criado por ${message.author.tag}`
      });

      if (position && position < message.guild.roles.cache.size) {
        await role.setPosition(position);
      }

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.successEmoji} Cargo criado)
        .setColor(colors.green)
        .setDescription(`O cargo ${role.toString()} foi criado com os parâmetros abaixo:`)
        .addFields(
          { name: 'Nome', value: `\`${role.name}\``, inline: true },
          { name: 'Cor', value: role.hexColor, inline: true },
          { name: 'Mencionável', value: mentionable ? 'Sim' : 'Não', inline: true },
          { name: 'Permissões', value: permissions.length ? `\`${permissions.join(', ')}\`` : 'Nenhuma', inline: false },
          { name: 'Posição', value: position?.toString() || 'Padrão', inline: true }
        )
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error('[createrole] Erro ao criar cargo:', error);
      return sendEmbed('yellow', message, 'Não foi possível criar o cargo');
    }
  }
};
