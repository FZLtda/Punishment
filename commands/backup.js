const { EmbedBuilder, PermissionsBitField, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

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
            id: role.id.toString(),
            name: role.name,
            color: role.color,
            permissions: role.permissions.bitfield.toString(),
            position: role.position,
            hoist: role.hoist,
            mentionable: role.mentionable,
          })),
        channels: guild.channels.cache
          .sort((a, b) => a.rawPosition - b.rawPosition)
          .map((channel) => ({
            id: channel.id.toString(),
            name: channel.name,
            type: channel.type,
            parentId: channel.parentId ? channel.parentId.toString() : null,
            position: channel.rawPosition,
            permissionOverwrites: channel.permissionOverwrites.cache.map((overwrite) => ({
              id: overwrite.id.toString(),
              type: overwrite.type,
              allow: overwrite.allow.bitfield.toString(),
              deny: overwrite.deny.bitfield.toString(),
            })),
          })),
      };

      const backupPath = path.resolve(__dirname, '../backups');
      if (!fs.existsSync(backupPath)) fs.mkdirSync(backupPath);

      const timestamp = Date.now();
      const backupFile = path.join(backupPath, `backup-${guild.id}-${timestamp}.json`);
      fs.writeFileSync(backupFile, JSON.stringify(backupData, serializeBigInt, 2));

      const embed = new EmbedBuilder()
        .setTitle('<:emoji_33:1219788320234803250> Backup Criado com Sucesso')
        .setColor('Green')
        .setDescription('As informações do servidor foram salvas com sucesso!')
        .addFields({ name: 'Servidor', value: `${guild.name}`, inline: true })
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      const msg = await message.channel.send({ embeds: [embed] });

      const attachment = new AttachmentBuilder(backupFile);
      await message.channel.send({ files: [attachment] });
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedBuilder()
        .setTitle('<:no:1122370713932795997> Erro ao Criar Backup')
        .setDescription('Houve um problema ao tentar criar o backup.')
        .setColor('Red')
        .setTimestamp();

      return message.channel.send({ embeds: [errorEmbed] });
    }
  },
};