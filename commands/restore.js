const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');

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
      // Baixa o arquivo de backup
      const response = await fetch(attachment.url);
      const backupData = await response.json();

      // Verifica o formato do backup
      if (!backupData.roles || !backupData.channels) {
        return message.reply('<:no:1122370713932795997> O arquivo de backup é inválido ou está corrompido.');
      }

      const guild = message.guild;

      // Restaurar cargos
      for (const roleData of backupData.roles) {
        if (guild.roles.cache.has(roleData.id)) continue; // Ignorar cargos já existentes

        await guild.roles.create({
          name: roleData.name,
          color: roleData.color,
          permissions: BigInt(roleData.permissions),
          hoist: roleData.hoist,
          mentionable: roleData.mentionable,
          position: roleData.position,
        });
      }

      // Restaurar canais
      for (const channelData of backupData.channels) {
        if (guild.channels.cache.has(channelData.id)) continue; // Ignorar canais já existentes

        const parent = channelData.parentId
          ? guild.channels.cache.get(channelData.parentId)
          : null;

        await guild.channels.create({
          name: channelData.name,
          type: channelData.type,
          parent: parent || null,
          position: channelData.position,
          permissionOverwrites: channelData.permissionOverwrites.map((overwrite) => ({
            id: overwrite.id,
            allow: BigInt(overwrite.allow),
            deny: BigInt(overwrite.deny),
            type: overwrite.type,
          })),
        });
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