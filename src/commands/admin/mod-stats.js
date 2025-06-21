const { EmbedBuilder } = require('discord.js');
const db = require('@data/database');
const { colors, emojis } = require('@config');

module.exports = {
  name: 'mod-stats',
  description: 'Exibe estatísticas detalhadas da moderação no servidor.',
  usage: '${currentPrefix}mod-stats',
  userPermissions: ['ManageGuild'],
  botPermissions: ['SendMessages', 'EmbedLinks'],
  deleteMessage: true,

  async execute(message) {

    try {
      const guildId = message.guild.id;

      const totalActions = db
        .prepare('SELECT COUNT(*) AS count FROM mod_actions WHERE guild_id = ?')
        .get(guildId);

      const actionsByType = db
        .prepare('SELECT action_type, COUNT(*) AS count FROM mod_actions WHERE guild_id = ? GROUP BY action_type')
        .all(guildId);

      const actionsByModerator = db
        .prepare(
          'SELECT moderator_id, COUNT(*) AS count FROM mod_actions WHERE guild_id = ? GROUP BY moderator_id ORDER BY count DESC LIMIT 5'
        )
        .all(guildId);

      const recentActions = db
        .prepare(
          'SELECT moderator_id, action_type, target_id, reason, timestamp FROM mod_actions WHERE guild_id = ? ORDER BY timestamp DESC LIMIT 5'
        )
        .all(guildId);

      const typeStats = actionsByType.length
        ? actionsByType.map(action => `**${action.action_type}:** \`${action.count}\``).join('\n')
        : '`Nenhuma ação registrada.`';

      const moderatorStats = actionsByModerator.length
        ? await Promise.all(
          actionsByModerator.map(async mod => {
            const user = await message.guild.members.fetch(mod.moderator_id).catch(() => null);
            const username = user ? user.user.tag : 'Usuário desconhecido';
            return `**${username}:** \`${mod.count}\` ações`;
          })
        ).then(stats => stats.join('\n'))
        : '`Nenhuma ação registrada.`';

      const recentStats = recentActions.length
        ? await Promise.all(
          recentActions.map(async action => {
            const moderator = await message.guild.members.fetch(action.moderator_id).catch(() => null);
            const target = await message.guild.members.fetch(action.target_id).catch(() => null);
            const moderatorName = moderator ? moderator.user.tag : 'Desconhecido';
            const targetName = target ? target.user.tag : 'Desconhecido';
            return `**${action.action_type}:** \`${moderatorName} -> ${targetName}\`\nMotivo: \`${action.reason || 'Nenhum'}\`\n`;
          })
        ).then(stats => stats.join('\n'))
        : '`Nenhuma ação registrada.`';

      const embed = new EmbedBuilder()
        .setTitle('Estatísticas de Moderação')
        .setColor(colors.red)
        .addFields(
          { name: '<:1000043480:1336455409904517151> Total de Ações', value: `\`${totalActions.count || 0}\``, inline: true },
          { name: '<:1000043157:1336324220770062497> Ações por Tipo', value: typeStats, inline: true },
          { name: '<:1000043165:1336327290446942280> Top Moderadores', value: moderatorStats, inline: false },
          { name: '<:1000043158:1336324199202947144> Ações Recentes', value: recentStats, inline: false }
        )
        .setFooter({
          text: `${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed], allowedMentions: { repliedUser: false } });
    } catch (error) {
      console.error('[ERROR] Falha ao gerar estatísticas de moderação:', error);
      const embedErro = new EmbedBuilder()
        .setColor(colors.yellow)
        .setAuthor({
          name: 'Não foi possível gerar as estatísticas de moderação devido a um erro.',
          iconURL: emojis.icon_attention,
        });

      return message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
    }
  },
};
