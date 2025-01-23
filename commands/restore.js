const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const fetch = require('node-fetch');

module.exports = {
  name: 'restore',
  description: 'Restaura o estado do servidor a partir de um arquivo de backup.',
  async execute(message) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('<:no:1122370713932795997> Você não tem permissão para usar este comando.');
    }

    const attachment = message.attachments.first();
    if (!attachment) {
      return message.reply('<:no:1122370713932795997> Por favor, envie o arquivo de backup junto com o comando.');
    }

    try {
      const response = await fetch(attachment.url);
      const backupData = await response.json();

      if (!backupData.roles || !backupData.channels) {
        return message.reply('<:no:1122370713932795997> O arquivo de backup é inválido ou está corrompido.');
      }

      const guild = message.guild;

      const categoryMapping = new Map();
      const channelMapping = new Map();
      const roleMapping = new Map();

      for (const roleData of backupData.roles) {
        if (guild.roles.cache.has(roleData.id)) continue;

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
        const newCategory = await guild.channels.create({
          name: channelData.name,
          type: channelData.type,
          position: channelData.position,
        });
        categoryMapping.set(channelData.id, newCategory.id);
        channelMapping.set(channelData.id, newCategory.id);
      }

      for (const channelData of backupData.channels.filter((ch) => ch.type !== 4)) {
        const parentId = categoryMapping.get(channelData.parentId) || null;

        const newChannel = await guild.channels.create({
          name: channelData.name,
          type: channelData.type,
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

      const embed = new EmbedBuilder()
        .setTitle('<:emoji_33:1219788320234803250> Restauração Completa')
        .setColor('Green')
        .setDescription('O estado do servidor foi restaurado com sucesso a partir do backup fornecido!')
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return message.reply('<:no:1122370713932795997> Ocorreu um erro ao tentar restaurar o backup.');
    }
  },
};