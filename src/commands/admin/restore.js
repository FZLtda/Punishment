const { EmbedBuilder } = require('discord.js');
const { logModerationAction } = require('../../utils/moderationUtils');
const { yellow, green } = require('../../config/colors.json');
const { icon_attention, success } = require('../../config/emoji.json');
const Backup = require('../../models/Backup');

module.exports = {
  name: 'restore',
  description: 'Restaura o estado do servidor a partir do ID de backup salvo.',
  usage: '${currentPrefix}restore <id>',
  userPermissions: ['ManageGuild'],
  botPermissions: ['ManageGuild'],
  deleteMessage: true,

  async execute(message, args) {
    const backupId = args[0];

    if (!backupId) {
      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Você precisa fornecer o ID do backup.',
          iconURL: icon_attention,
        });
      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    try {
      const backupData = await Backup.findById(backupId);

      if (!backupData) {
        const embedErro = new EmbedBuilder()
          .setColor(yellow)
          .setAuthor({
            name: 'Nenhum backup foi encontrado com esse ID.',
            iconURL: icon_attention,
          });
        return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
      }

      const guild = message.guild;

      const categoryMapping = new Map();
      const channelMapping = new Map();
      const roleMapping = new Map();

      const channelTypeMapping = {
        GUILD_TEXT: 0,
        GUILD_VOICE: 2,
        GUILD_CATEGORY: 4,
        GUILD_NEWS: 5,
        GUILD_STAGE_VOICE: 13,
      };

      const serverChannelIds = guild.channels.cache.map((channel) => channel.id);

      for (const roleData of backupData.roles) {
        const existingRole = guild.roles.cache.find(
          (role) =>
            role.name === roleData.name &&
            role.color === roleData.color &&
            role.permissions.bitfield.toString() === roleData.permissions
        );

        if (existingRole) {
          roleMapping.set(roleData.id, existingRole.id);
          continue;
        }

        const newRole = await guild.roles.create({
          name: roleData.name,
          color: roleData.color,
          permissions: BigInt(roleData.permissions),
          hoist: roleData.hoist,
          mentionable: roleData.mentionable,
        });
        roleMapping.set(roleData.id, newRole.id);
      }

      for (const channelData of backupData.channels.filter((ch) => ch.type === 4)) {
        if (serverChannelIds.includes(channelData.id)) {
          categoryMapping.set(channelData.id, channelData.id);
          channelMapping.set(channelData.id, channelData.id);
          continue;
        }

        const newCategory = await guild.channels.create({
          name: channelData.name,
          type: channelTypeMapping['GUILD_CATEGORY'],
          position: channelData.position,
        });
        categoryMapping.set(channelData.id, newCategory.id);
        channelMapping.set(channelData.id, newCategory.id);
      }

      for (const channelData of backupData.channels.filter((ch) => ch.type !== 4)) {
        if (serverChannelIds.includes(channelData.id)) {
          channelMapping.set(channelData.id, channelData.id);
          continue;
        }

        const parentId = categoryMapping.get(channelData.parentId) || null;

        const newChannel = await guild.channels.create({
          name: channelData.name,
          type: channelTypeMapping[channelData.type] || 0,
          parent: parentId,
          position: channelData.position,
          permissionOverwrites: channelData.permissionOverwrites.map((overwrite) => ({
            id: roleMapping.get(overwrite.id) || overwrite.id,
            allow: BigInt(overwrite.allow),
            deny: BigInt(overwrite.deny),
            type: overwrite.type,
          })),
        });
        channelMapping.set(channelData.id, newChannel.id);
      }

      logModerationAction(
        guild.id,
        message.author.id,
        'Restore',
        null,
        `Servidor restaurado com ${backupData.roles.length} cargos e ${backupData.channels.length} canais`
      );

      const embed = new EmbedBuilder()
        .setTitle(`${success} Restauração Completa`)
        .setColor(green)
        .setDescription('Servidor restaurado com sucesso!')
        .addFields(
          { name: 'Canais Restaurados', value: `${backupData.channels.length}`, inline: true },
          { name: 'Cargos Restaurados', value: `${backupData.roles.length}`, inline: true }
        )
        .setFooter({
          text: message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Não foi possível restaurar o backup devido a um erro.',
          iconURL: icon_attention,
        });
      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  },
};
