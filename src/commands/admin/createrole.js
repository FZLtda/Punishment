'use strict';

/**
 * Cria um novo cargo no servidor com configurações avançadas.
 * Suporte a: nome, cor, mencionável, permissões e posição.
 */

const {
  EmbedBuilder,
  PermissionsBitField
} = require('discord.js');
const { colors } = require('@config');
const { sendEmbed } = require('@utils/embedReply');

// Cores nomeadas comuns (extendível)
const namedColors = {
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
};

module.exports = {
  name: 'createrole',
  description: 'Cria um novo cargo com opções avançadas.',
  usage: '${currentPrefix}createrole <nome> [--cor <hex|nome>] [--men <true|false>] [--perms <P1,P2,...>] [--pos <número>]',
  userPermissions: ['ManageRoles'],
  botPermissions: ['ManageRoles'],
  deleteMessage: true,

  async execute(message, args) {
    const input = args.join(' ');
    const regex = /^(?<name>.+?)(?:\s--cor\s(?<color>\S+))?(?:\s--men\s(?<mentionable>true|false))?(?:\s--perms\s(?<perms>[A-Z_,]+))?(?:\s--pos\s(?<pos>\d+))?$/i;
    const match = input.match(regex)?.groups || {};

    const name = match.name?.trim();
    if (!name) {
      return sendEmbed('yellow', message, 'Você deve fornecer um nome para o cargo.');
    }

    let color = match.color;
    if (color) {
      color = color.toUpperCase();
      if (namedColors[color]) {
        color = namedColors[color];
      } else if (!/^#?[0-9A-F]{6}$/i.test(color)) {
        return sendEmbed('yellow', message, 'Cor inválida. Use um código hexadecimal ou uma cor nomeada como RED, BLUE, etc.');
      }
    }

    const mentionable = match.mentionable === 'true';
    const position = match.pos ? parseInt(match.pos, 10) : undefined;

    const permissions = [];
    if (match.perms) {
      for (const perm of match.perms.split(',').map(p => p.trim())) {
        if (PermissionsBitField.Flags[perm]) {
          permissions.push(perm);
        }
      }
    }

    try {
      const role = await message.guild.roles.create({
        name,
        color,
        mentionable,
        permissions: permissions.length ? new PermissionsBitField(permissions) : undefined,
        reason: `Criado por: ${message.author.tag}`
      });

      if (position && position < message.guild.roles.cache.size) {
        await role.setPosition(position);
      }

      const embed = new EmbedBuilder()
        .setTitle('Cargo Criado com Sucesso')
        .setColor(colors.green)
        .setDescription(`O cargo ${role.toString()} foi criado com os seguintes parâmetros:`)
        .addFields(
          { name: 'Nome', value: role.name, inline: true },
          { name: 'Cor', value: role.hexColor, inline: true },
          { name: 'Mencionável', value: role.mentionable ? 'Sim' : 'Não', inline: true },
          { name: 'Permissões', value: permissions.length ? `\`${permissions.join(', ')}\`` : 'Nenhuma', inline: false },
          { name: 'Posição', value: position?.toString() || 'Padrão', inline: true }
        )
        .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

    } catch (err) {
      console.error('[createrole] Erro ao criar cargo:', err);
      return sendEmbed('red', message, 'Não foi possível criar o cargo. Verifique se os parâmetros são válidos.');
    }
  }
};
