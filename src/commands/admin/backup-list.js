const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { yellow } = require('../../config/colors.json');
const { icon_attention } = require('../../config/emoji.json');

module.exports = {
  name: 'backup-list',
  description: 'Lista todos os backups disponíveis do servidor.',
  usage: '${currentPrefix}backup-list',
  userPermissions: ['Administrator'],
  botPermissions: ['Administrator'],
  deleteMessage: true,

  async execute(message) {
    try {
      const backupPath = path.resolve(__dirname, '../backups');
      if (!fs.existsSync(backupPath)) fs.mkdirSync(backupPath);

      const files = fs.readdirSync(backupPath).filter(file => file.endsWith('.json'));
      const backups = files.filter(file => file.includes(message.guild.id));

      if (!backups.length) {
        const embedAviso = new EmbedBuilder()
          .setColor(yellow)
          .setAuthor({
            name: 'Nenhum backup encontrado para este servidor.',
            iconURL: icon_attention
          });

        return message.channel.send({ embeds: [embedAviso] });
      }

      const embed = new EmbedBuilder()
        .setTitle('<:Backup:1355721566582997054> Lista de Backups')
        .setColor('Blue')
        .setDescription(backups.map((file, i) => `\`${i + 1}.\` ${file}`).join('\n'))
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error(error);

      const embedErro = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Erro ao listar os backups.',
          iconURL: icon_attention
        });

      return message.channel.send({ embeds: [embedErro] });
    }
  },
};
