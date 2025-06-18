const { EmbedBuilder } = require('discord.js');
const { yellow, green } = require('../../config/colors.json');
const { icon_attention } = require('../../config/emoji.json');
const { logModerationAction } = require('../../utils/moderationUtils');
const Backup = require('../../models/Backup');

module.exports = {
  name: 'restore',
  description: 'Restaura o estado do servidor a partir de um backup salvo.',
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
          name: 'Você precisa fornecer o ID do backup que deseja restaurar.',
          iconURL: icon_attention
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }

    try {
      const backupData = await Backup.findById(backupId);

      if (!backupData || !backupData.roles || !backupData.channels) {
        const embedErro = new EmbedBuilder()
          .setColor(yellow)
          .setAuthor({
            name: 'Backup não encontrado ou inválido.',
            iconURL: icon_attention
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

      const serverChannelIds = guild.channels.cache.map(ch => ch.id);

      for (const roleData of backupData.roles) {
        const existing = guild.roles.cache.find(
          r => r.name === roleData.name &&
               r.color === roleData.color &&
               r.permissions.bitfield.toString() === roleData.permissions
        );

        if (existing) {
          roleMapping.set(roleData.id, existing.id);
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

      for (const cat of backupData.channels.filter(ch => ch.type === 4)) {
        if (serverChannelIds.includes(cat.id)) {
          categoryMapping.set(cat.id, cat.id);
          channelMapping.set(cat.id, cat.id);
          continue;
        }

        const newCat = await guild.channels.create({
          name: cat.name,
          type: channelTypeMapping['GUILD_CATEGORY'],
          position: cat.position,
        });

        categoryMapping.set(cat.id, newCat.id);
        channelMapping.set(cat.id, newCat.id);
      }

      for (const ch of backupData.channels.filter(ch => ch.type !== 4)) {
        if (serverChannelIds.includes(ch.id)) {
          channelMapping.set(ch.id, ch.id);
          continue;
        }

        const parentId = categoryMapping.get(ch.parentId) || null;

        const newChannel = await guild.channels.create({
          name: ch.name,
          type: channelTypeMapping[ch.type] ?? 0,
          parent: parentId,
          position: ch.position,
          permissionOverwrites: ch.permissionOverwrites.map(overwrite => ({
            id: roleMapping.get(overwrite.id) || overwrite.id,
            allow: BigInt(overwrite.allow),
            deny: BigInt(overwrite.deny),
            type: overwrite.type,
          })),
        });

        channelMapping.set(ch.id, newChannel.id);
      }

      logModerationAction(
        guild.id,
        message.author.id,
        'Restore',
        backupId,
        `Servidor restaurado com ${backupData.roles.length} cargos e ${backupData.channels.length} canais`
      );

      const embedSucesso = new EmbedBuilder()
        .setTitle('<:1000042885:1336044571125354496> Restauração Completa')
        .setColor(green)
        .setDescription('O estado do servidor foi restaurado com sucesso a partir do backup!')
        .addFields(
          { name: 'Canais Restaurados', value: `${backupData.channels.length}`, inline: true },
          { name: 'Cargos Restaurados', value: `${backupData.roles.length}`, inline: true }
        )
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embedSucesso] });

    } catch (error) {
      console.error(error);

      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Erro ao restaurar o backup.',
          iconURL: icon_attention
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  },
};
