const { PermissionsBitField } = require('discord.js');
const { logModerationAction } = require('../moderationUtils');

const antispamStatus = new Map();
const messageCounts = new Map();

module.exports = {
  name: 'antispam',
  description: 'Ativa ou desativa o sistema de bloqueio de spam no servidor.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('<:no:1122370713932795997> Você não tem permissão para usar este comando.');
    }

    const subcommand = args[0]?.toLowerCase();
    if (!subcommand || !['on', 'off'].includes(subcommand)) {
      return message.reply('<:no:1122370713932795997> Use: `antispam on` para ativar ou `antispam off` para desativar.');
    }

    const isEnabled = subcommand === 'on';
    antispamStatus.set(message.guild.id, isEnabled);

    logModerationAction(
      message.guild.id,
      message.author.id,
      'Antispam',
      null,
      `Sistema de antispam ${isEnabled ? 'ativado' : 'desativado'}`
    );

    return message.reply(
      `<:emoji_33:1219788320234803250> Sistema de bloqueio de spam ${
        isEnabled ? 'ativado' : 'desativado'
      } com sucesso.`
    );
  },

  init(client) {
    client.on('messageCreate', async (message) => {
      const isAntispamEnabled = antispamStatus.get(message.guild?.id);
      if (!isAntispamEnabled || !message.guild || message.author.bot) return;

      if (message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return;

      const guildId = message.guild.id;
      const authorId = message.author.id;
      const key = `${guildId}-${authorId}`;

      if (!messageCounts.has(key)) {
        messageCounts.set(key, { count: 0, timestamp: Date.now() });
      }

      const userData = messageCounts.get(key);
      const timeSinceFirstMessage = Date.now() - userData.timestamp;

      if (timeSinceFirstMessage > 10000) {
        userData.count = 0;
        userData.timestamp = Date.now();
      }

      userData.count++;

      const SPAM_LIMIT = 5;

      if (userData.count > SPAM_LIMIT) {
        try {
          await message.delete();

          const warning = await message.channel.send(
            `<:no:1122370713932795997> ${message.author}, você está enviando mensagens muito rápido.`
          );

          setTimeout(() => warning.delete().catch(() => null), 5000);

          await message.member.timeout(10 * 60 * 1000, 'Spam detectado pelo sistema de antispam.');

          logModerationAction(
            guildId,
            client.user.id,
            'Timeout',
            authorId,
            'Spam detectado e usuário mutado automaticamente'
          );
        } catch (error) {
          console.error('Erro ao processar antispam:', error);
        }
      }
    });
  },
};