const { PermissionsBitField } = require('discord.js');

const antilinkStatus = new Map();

module.exports = {
  name: 'antilink',
  description: 'Ativa ou desativa o sistema de bloqueio de links no servidor.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('<:no:1122370713932795997> Você não tem permissão para usar este comando.');
    }

    const subcommand = args[0]?.toLowerCase();
    if (!subcommand || !['on', 'off'].includes(subcommand)) {
      return message.reply('<:no:1122370713932795997> Use: `antilink on` para ativar ou `antilink off` para desativar.');
    }

    const isEnabled = subcommand === 'on';
    antilinkStatus.set(message.guild.id, isEnabled);

    console.log(`Antilink para o servidor ${message.guild.id}: ${isEnabled}`);

    return message.reply(
      `**<:emoji_33:1219788320234803250> Sistema de bloqueio de links ${
        isEnabled ? 'ativado' : 'desativado'
      } com sucesso.**`
    );
  },

  init(client) {
    client.on('messageCreate', async (message) => {
      const isAntilinkEnabled = antilinkStatus.get(message.guild?.id);
      if (!isAntilinkEnabled) return;

      if (!message.guild || message.author.bot) return;
      if (message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;

      const linkRegex = /(https?:\/\/|www\.)\S+/gi;

      if (linkRegex.test(message.content)) {
        try {
          await message.delete();
          const reply = await message.channel.send(
            `<:no:1122370713932795997> ${message.author}, links não são permitidos neste servidor.`
          );

          setTimeout(() => reply.delete().catch(() => null), 5000);
        } catch (error) {
          console.error('Erro ao excluir a mensagem:', error);
        }
      }
    });
  },
};