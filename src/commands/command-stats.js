const { EmbedBuilder } = require('discord.js');
const db = require('../data/database');
const { icon_attention } = require('../config/emoji.json');
const { yellow, red } = require('../config/colors.json');

module.exports = {
  name: 'command-stats',
  description: 'Exibe estatísticas de uso dos comandos do bot.',
  usage: '${currentPrefix}command-stats',
  userPermissions: ['SendMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message) {
    const allowedUserId = '1006909671908585586';

    if (message.author.id !== allowedUserId) {
      const embedSemPermissao = new EmbedBuilder()
        .setColor(yellow)
        .setAuthor({
          name: 'Você não tem permissão para usar este comando.',
          iconURL: icon_attention,
        });

      return message.reply({ embeds: [embedSemPermissao], allowedMentions: { repliedUser: false } });
    }

    try {
      
      const totalCommands = db
        .prepare('SELECT SUM(usage_count) AS total FROM command_usage')
        .get().total || 0;

      const mostUsedCommand = db
        .prepare('SELECT command_name, usage_count FROM command_usage ORDER BY usage_count DESC LIMIT 1')
        .get();

      const leastUsedCommand = db
        .prepare('SELECT command_name, usage_count FROM command_usage ORDER BY usage_count ASC LIMIT 1')
        .get();

      const allCommands = db
        .prepare('SELECT command_name, usage_count FROM command_usage ORDER BY usage_count DESC')
        .all();

      const commandStats = allCommands.length > 0
        ? allCommands
            .map((cmd, index) =>
              `**${index + 1}. ${cmd.command_name}** — \`${cmd.usage_count}\` usos (${(
                (cmd.usage_count / totalCommands) * 100
              ).toFixed(2)}%)`)
            .slice(0, 10)
            .join('\n')
        : '`Nenhum comando registrado.`';

      const embed = new EmbedBuilder()
        .setTitle('Estatísticas de Comandos')
        .setColor('DarkVividPink')
        .addFields(
          {
            name: 'Total de Comandos Executados',
            value: `\`${totalCommands}\``,
            inline: true,
          },
          {
            name: 'Mais Usado',
            value: mostUsedCommand
              ? `\`${mostUsedCommand.command_name}\` — \`${mostUsedCommand.usage_count}\` usos`
              : '`Nenhum comando registrado.`',
            inline: true,
          },
          {
            name: 'Menos Usado',
            value: leastUsedCommand
              ? `\`${leastUsedCommand.command_name}\` — \`${leastUsedCommand.usage_count}\` usos`
              : '`Nenhum comando registrado.`',
            inline: true,
          },
          {
            name: 'Top 10 Comandos',
            value: commandStats,
            inline: false,
          }
        )
        .setFooter({
          text: message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });

    } catch (err) {
      console.error('[ERRO] Falha ao gerar estatísticas de comandos:', err);

      const embedErro = new EmbedBuilder()
        .setColor(red)
        .setAuthor({
          name: 'Ocorreu um erro ao tentar exibir as estatísticas.',
          iconURL: icon_attention,
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  },
};
