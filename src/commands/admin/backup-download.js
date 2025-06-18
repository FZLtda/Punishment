const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { yellow, green } = require('../../config/colors.json');
const { icon_attention } = require('../../config/emoji.json');

module.exports = {
  name: 'backup-download',
  description: 'Envia o arquivo de backup solicitado.',
  usage: '${currentPrefix}backup-download <nome_do_arquivo>',
  userPermissions: ['Administrator'],
  botPermissions: ['Administrator'],
  deleteMessage: true,

  async execute(message, args) {
    const fileName = args[0];
    if (!fileName) {
      const embedAviso = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Você precisa informar o nome do backup.',
          iconURL: icon_attention
        });

      return message.channel.send({ embeds: [embedAviso] });
    }

    try {
      const backupPath = path.resolve(__dirname, '../backups');
      const filePath = path.join(backupPath, fileName);

      if (!fs.existsSync(filePath)) {
        const embedErro = new EmbedBuilder()
          .setColor(yellow)
          .setAuthor({
            name: `O backup \`${fileName}\` não foi encontrado.`,
            iconURL: icon_attention
          });

        return message.channel.send({ embeds: [embedErro] });
      }

      const embed = new EmbedBuilder()
        .setTitle('<:Backup:1355721566582997054> Backup Enviado')
        .setColor(green)
        .setDescription(`O arquivo \`${fileName}\` foi enviado abaixo.`)
        .setFooter({
          text: message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      const attachment = new AttachmentBuilder(filePath);

      await message.channel.send({ embeds: [embed], files: [attachment] });

    } catch (error) {
      console.error(error);

      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Não foi possível enviar o backup.',
          iconURL: icon_attention
        });

      return message.channel.send({ embeds: [embedErro] });
    }
  },
};
