const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { userPermissions } = require('./addrole');

const colorMapping = {
  RED: '#FF0000',
  BLUE: '#3498DB',
  GREEN: '#2ECC71',
  YELLOW: '#F1C40F',
  ORANGE: '#E67E22',
  PURPLE: '#9B59B6',
  PINK: '#FFC0CB',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY: '#808080',
};

module.exports = {
  name: 'createrole',
  description: 'Cria um cargo com nome, cor, permissões, posição e opção de ser mencionável.',
  usage: '${currentPrefix}createrole <nome> [cor] [permissões] [posição] [menção automática]',
  userPermissions: ['ManageRoles'],
  botPermissions: ['ManageRoles'],
  deleteMessage: true,
  
  async execute(message, args) {
    try {
      const errorEmbed = (desc) => new EmbedBuilder()
        .setColor('#FF4C4C')
        .setAuthor({ name: desc, iconURL: 'https://bit.ly/43PItSI' });

      if (!args[0])
        return message.reply({ embeds: [errorEmbed('Você precisa fornecer um nome para o cargo.')], allowedMentions: { repliedUser: false } });

      const roleName = args[0];
      const colorInput = args[1]?.toUpperCase() || 'WHITE';
      const roleColor = colorMapping[colorInput] || (colorInput.startsWith('#') ? colorInput : null);

      if (!roleColor)
        return message.reply({ embeds: [errorEmbed('A cor fornecida é inválida. Use um nome de cor válido ou código hexadecimal.')], allowedMentions: { repliedUser: false } });

      const permissionsInput = args[2] || '';
      const permissionsArray = permissionsInput.split(/[\s,]+/).map(p => p.toUpperCase().replace(/ /g, '_')).filter(Boolean);
      const resolvedPermissions = new PermissionsBitField();
      const invalidPermissions = [];

      for (const perm of permissionsArray) {
        if (PermissionsBitField.Flags[perm]) {
          resolvedPermissions.add(PermissionsBitField.Flags[perm]);
        } else {
          invalidPermissions.push(perm);
        }
      }

      if (invalidPermissions.length)
        return message.reply({
          embeds: [
            errorEmbed('As seguintes permissões são inválidas:')
              .setDescription(`\`${invalidPermissions.join(', ')}\``)
              .addFields({ name: 'Permissões válidas', value: Object.keys(PermissionsBitField.Flags).join(', ') })
          ],
          allowedMentions: { repliedUser: false }
        });

      const position = args[3] && !isNaN(args[3]) ? parseInt(args[3], 10) : undefined;
      if (args[3] && (position < 0 || position > message.guild.roles.cache.size))
        return message.reply({ embeds: [errorEmbed('A posição fornecida é inválida. Use um número válido.')], allowedMentions: { repliedUser: false } });

      const mentionable = args[4]?.toLowerCase() === 'true';

      const newRole = await message.guild.roles.create({
        name: roleName,
        color: roleColor,
        permissions: resolvedPermissions.bitfield,
        position,
        mentionable,
        reason: `Criado por ${message.author.tag}`,
      });

      const embed = new EmbedBuilder()
        .setTitle('<:emoji_33:1219788320234803250> Cargo Criado com Sucesso!')
        .setColor(roleColor)
        .addFields(
          { name: 'Nome do Cargo', value: newRole.name, inline: true },
          { name: 'Cor', value: newRole.hexColor.toUpperCase(), inline: true },
          { name: 'Permissões', value: newRole.permissions.toArray().join(', ') || 'Nenhuma', inline: false },
          { name: 'Posição', value: position?.toString() || 'Padrão', inline: true },
          { name: 'Mencionável', value: mentionable ? 'Sim' : 'Não', inline: true }
        )
        .setFooter({ text: `Criado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error('Erro ao criar cargo:', error);
      return message.reply({
        embeds: [new EmbedBuilder().setColor('#FF4C4C').setAuthor({ name: 'Ocorreu um erro ao criar o cargo.', iconURL: 'https://bit.ly/43PItSI' })],
        allowedMentions: { repliedUser: false }
      });
    }
  },
};
