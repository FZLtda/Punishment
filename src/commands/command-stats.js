const { EmbedBuilder } = require('discord.js');
const db = require('../data/database');
const { error } = require('../config/emoji.json');

module.exports = {
  name: 'command-stats',
  description: 'Exibe estatísticas de uso dos comandos do bot.',
  usage: '${currentPrefix}command-stats',
  permissions: 'Administrador',
  execute: async (message) => {
    try {
      const allowedUserId = '1006909671908585586';

      if (message.author.id !== allowedUserId) {
        return message.reply({
          content: `${error} Você não tem permissão para usar este comando.`,
          allowedMentions: { repliedUser: false },
        });
      }

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

      const commandStats = allCommands
        .map(
          (cmd, index) =>
            `**${index + 1}. ${cmd.command_name}** \`${cmd.usage_count}\` usos (${(
              (cmd.usage_count / totalCommands) *
              100
            ).toFixed(2)}%)`
        )
        .slice(0, 10)
        .join('\n');

      const embed = new EmbedBuilder()
        .setColor('#3498DB')
        .setTitle('Estatísticas')
        .addFields(
          { name: 'Comandos Executados', value: `\`${totalCommands}\``, inline: true },
          {
            name: 'Mais Usado',
            value: mostUsedCommand
              ? `\`${mostUsedCommand.command_name}\` \`${mostUsedCommand.usage_count}\` usos`
              : '`Nenhum comando registrado.`',
            inline: true,
          },
          {
            name: 'Menos Usado',
            value: leastUsedCommand
              ? `\`${leastUsedCommand.command_name}\` \`${leastUsedCommand.usage_count}\` usos`
              : '`Nenhum comando registrado.`',
            inline: true,
          },
          {
            name: 'Top 10',
            value: commandStats || '`Nenhum comando registrado.`',
            inline: false,
          }
        )
        .setFooter({
          text: `${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
    } catch (error) {
      console.error('[ERRO] Falha ao executar o comando command-stats:', error);
      return message.reply({
        content: `${error} Não foi possivel exibir as estatísticas dos comandos.`,
        allowedMentions: { repliedUser: false },
      });
    }
  },
};