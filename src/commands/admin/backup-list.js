const { EmbedBuilder } = require('discord.js');
const { yellow } = require('../../config/colors.json');
const { icon_attention } = require('../../config/emoji.json');
const Backup = require('../../models/Backup');

module.exports = {
  name: 'backup-list',
  description: 'Lista todos os backups disponíveis do servidor.',
  usage: '${currentPrefix}backup-list',
  userPermissions: ['Administrator'],
  botPermissions: ['Administrator'],
  deleteMessage: true,

  async execute(message) {
    try {
      const backups = await Backup.find({ guildId: message.guild.id }).sort({ createdAt: -1 });

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
        .setDescription(
          backups
            .map((backup, index) => {
              const data = new Date(backup.createdAt).toLocaleString('pt-BR');
              return `\`${index + 1}.\` **ID:** \`${backup._id}\` - Criado em: **${data}**`;
            })
            .slice(0, 10) // [limita a exibição para os 10 mais recentes]
            .join('\n')
        )
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
