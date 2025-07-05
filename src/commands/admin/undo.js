'use strict';

const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const ModerationAction = require('../../models/ModerationAction');

const { colors, emojis } = require('@config');
const Logger = require('@logger');

module.exports = {
  name: 'undo',
  description: 'Desfaz a última ação de moderação realizada ou uma ação específica por ID.',
  usage: '${currentPrefix}undo [ID da ação]',
  category: 'Moderação',
  userPermissions: ['Administrator'],
  botPermissions: ['ManageRoles', 'BanMembers', 'KickMembers'],
  cooldown: 5,

  async execute(message, args) {
    const actionId = args[0];

    const filtro = actionId
      ? { guildId: message.guild.id, actionId }
      : { guildId: message.guild.id, executorId: message.author.id };

    const action = await ModerationAction.findOne(filtro).sort({ createdAt: -1 });

    if (!action) {
      return sendError(message, 'Nenhuma ação encontrada para desfazer.');
    }

    const membro = await message.guild.members.fetch(action.targetId).catch(() => null);
    if (!membro && action.type !== 'ban') {
      return sendError(message, 'O membro alvo não está mais no servidor.');
    }

    let sucesso = false;
    let acaoDesfeita = '';

    try {
      switch (action.type) {
        case 'mute':
          if (action.roleId && membro.roles.cache.has(action.roleId)) {
            await membro.roles.remove(action.roleId, 'Undo de mute');
            sucesso = true;
            acaoDesfeita = 'Mute removido';
          } else {
            acaoDesfeita = 'O usuário não está mutado ou a role não existe.';
          }
          break;

        case 'ban':
          await message.guild.bans.remove(action.targetId, 'Undo de banimento');
          sucesso = true;
          acaoDesfeita = 'Banimento revertido';
          break;

        case 'kick':
          sucesso = false;
          acaoDesfeita = 'Kick não pode ser revertido.';
          break;

        case 'warn':
          sucesso = true;
          acaoDesfeita = 'Advertência anulada';
          break;

        default:
          acaoDesfeita = 'Tipo de ação não suportado para undo.';
          break;
      }

      if (sucesso) {
        await ModerationAction.deleteOne({ _id: action._id });

        const embed = new EmbedBuilder()
          .setTitle('Ação desfeita com sucesso')
          .setColor(colors.green)
          .addFields(
            { name: 'Usuário', value: `<@${action.targetId}>`, inline: true },
            { name: 'Ação', value: action.type, inline: true },
            { name: 'Executor original', value: `<@${action.executorId}>`, inline: true },
            { name: 'Status', value: acaoDesfeita, inline: true }
          )
          .setFooter({
            text: 'Punishment • Sistema Undo',
            iconURL: message.client.user.displayAvatarURL()
          })
          .setTimestamp();

        Logger.info(`[UNDO] ${acaoDesfeita} de ${action.type} em ${action.targetId} por ${message.author.tag}`);
        return message.channel.send({ embeds: [embed] });
      } else {
        return sendError(message, acaoDesfeita);
      }
    } catch (err) {
      Logger.error(`[UNDO] Falha ao desfazer ação: ${err.stack || err.message}`);
      return sendError(message, 'Erro ao tentar desfazer a ação. Verifique os logs.');
    }
  }
};

function sendError(message, texto) {
  const embed = new EmbedBuilder()
    .setColor(colors.red)
    .setDescription(`${emojis.error} ${texto}`);

  return message.channel.send({ embeds: [embed] });
}
