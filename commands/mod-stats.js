const { EmbedBuilder } = require('discord.js');
const db = require('../database');

module.exports = {
  name: 'mod-stats',
  description: 'Exibe estatísticas detalhadas de moderação no servidor.',
  usage: '!mod-stats',
  async execute(message) {
    if (!message.member.permissions.has('ManageGuild')) {
      return message.reply(
        '<:no:1122370713932795997> Você precisa da permissão **Gerenciar Servidor** para usar este comando.'
      );
    }

    try {
      const totalActions = db.prepare('SELECT COUNT(*) AS count FROM mod_actions').get();

      const actionsByType = db
        .prepare('SELECT action_type, COUNT(*) AS count FROM mod_actions GROUP BY action_type')
        .all();

      const actionsByModerator = db
        .prepare('SELECT moderator_id, COUNT(*) AS count FROM mod_actions GROUP BY moderator_id ORDER BY count DESC LIMIT 5')
        .all();

      const recentActions = db
        .prepare('SELECT moderator_id, action_type, target_id, reason, timestamp FROM mod_actions ORDER BY timestamp DESC LIMIT 5')
        .all();

      let typeStats = '';
      for (const action of actionsByType) {
        typeStats += `**${action.action_type}:** ${action.count}\n`;
      }

      let moderatorStats = '';
      for (const mod of actionsByModerator) {
        const user = await message.guild.members.fetch(mod.moderator_id).catch(() => null);
        const username = user ? user.user.tag : 'Usuário desconhecido';
        moderatorStats += `**${username}:** ${mod.count} ações\n`;
      }

      let recentStats = '';
      for (const action of recentActions) {
        const moderator = await message.guild.members.fetch(action.moderator_id).catch(() => null);
        const target = await message.guild.members.fetch(action.target_id).catch(() => null);
        const moderatorName = moderator ? moderator.user.tag : 'Desconhecido';
        const targetName = target ? target.user.tag : 'Desconhecido';
        recentStats += `**${action.action_type}:** ${moderatorName} -> ${targetName}\nMotivo: ${action.reason || 'Nenhum'}\n\n`;
      }

      const embed = new EmbedBuilder()
        .setTitle('<:emoji_48:1332357299339005974> Estatísticas de Moderação')
        .setColor('Blue')
        .addFields(
          { name: '<:emoji_49:1332357944888524850> Total de Ações', value: `${totalActions.count || 0}`, inline: true },
          { name: '<:emoji_49:1332356624869757058> Ações por Tipo', value: typeStats || 'Nenhuma ação registrada.', inline: true },
          { name: '<:emoji_47:1323358397684387900> Top Moderadores', value: moderatorStats || 'Nenhuma ação registrada.', inline: false },
          { name: '<:recente:1332355743592091780> Ações Recentes', value: recentStats || 'Nenhuma ação registrada.', inline: false }
        )
        .setFooter({
          text: `${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`[ERROR] Falha ao gerar estatísticas:`, error);
      return message.reply('<:no:1122370713932795997> Ocorreu um erro ao gerar as estatísticas de moderação.');
    }
  },
};