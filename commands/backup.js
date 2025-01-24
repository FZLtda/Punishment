const { EmbedBuilder, PermissionsBitField, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { logModerationAction } = require('../moderationUtils');

function serializeBigInt(key, value) {
  return typeof value === 'bigint' ? value.toString() : value;
}

module.exports = {
  name: 'backup',
  description: 'Cria um backup completo do servidor, incluindo canais, cargos e permissões.',
  async execute(message) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('<:no:1122370713932795997> Você não tem permissão para usar este comando.');
    }

    try {
      const guild = message.guild;

      const backupData = {
        guildName: guild.name,
        guildId: guild.id.toString(),
        roles: guild.roles.cache
          .filter((role) => role.id !== guild.id)
          .sort((a, b) => b.position - a.position)
          .map((role) => ({
            id: role.id?.toString() || 'N/A',
            name: role.name || 'Sem Nome',
            color: role.color || 0,
            permissions: role.permissions?.bitfield?.toString() || '0',
            position: role.position || 0,
            hoist: role.hoist || false,
            mentionable: role.mentionable || false,
          })),
        channels: guild.channels?.cache
          .sort((a, b) => (a.rawPosition || 0) - (b.rawPosition || 0))
          .map((channel) => ({
            id: channel.id?.toString() || 'N/A',
            name: channel.name || 'Sem Nome',
            type: channel.type || 'UNKNOWN',
            parentId: channel.parentId ? channel.parentId.toString() : null,
            position: channel.rawPosition || 0,
            permissionOverwrites: channel.permissionOverwrites?.cache
              ? channel.permissionOverwrites.cache.map((overwrite) => ({
                  id: overwrite.id?.toString() || 'N/A',
                  type: overwrite.type || 'UNKNOWN',
                  allow: overwrite.allow?.bitfield?.toString() || '0',
                  deny: overwrite.deny?.bitfield?.toString() || '0',
                }))
              : [],
          })),
      };

      const backupPath = path.resolve(__dirname, '../backups');
      if (!fs.existsSync(backupPath)) fs.mkdirSync(backupPath);

      const backupFile = path.join(backupPath, `backup_${guild.id}.json`);
      fs.writeFileSync(backupFile, JSON.stringify(backupData, serializeBigInt, 2));
      
      logModerationAction(message.guild.id,message.author.id, 'Backup', guild.id, 'Backup completo do servidor criado');

      const embed = new EmbedBuilder()
        .setTitle('<:emoji_46:1332034311800619029> Backup Criado com Sucesso')
        .setColor('Green')
        .setDescription('As informações do servidor foram salvas com sucesso!')
        .addFields({ name: 'Servidor', value: `${guild.name}`, inline: true })
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

      const attachment = new AttachmentBuilder(backupFile);
      await message.channel.send({ files: [attachment] });
    } catch (error) {
      console.error(error);

      const errorEmbed = new EmbedBuilder()
        .setTitle('<:no:1122370713932795997> Erro ao Criar Backup')
        .setDescription('Houve um problema ao tentar criar o backup. Confira o console para mais detalhes.')
        .setColor('Red')
        .setTimestamp();

      return message.channel.send({ embeds: [errorEmbed] });
    }
  },
};