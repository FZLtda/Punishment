'use strict';

const { EmbedBuilder } = require('discord.js');
const ModerationAction = require('@models/ModerationAction');
const { colors, emojis } = require('@config');
const { sendEmbed } = require('@utils/embedReply');
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
      return sendEmbed('yellow', message, 'Nenhuma ação encontrada para desfazer.');
    }

    let membro = null;
    if (action.type !== 'ban') {
      membro = await message.guild.members.fetch(action.targetId).catch(() => null);
      if (!membro) return sendEmbed('yellow', message, 'O membro alvo não está mais no servidor.');
    }

    let sucesso = false;
    let acaoDesfeita = '';

    try {
      switch (action.type) {
        case 'mute':
        case 'timeout':
          if (membro?.communicationDisabledUntilTimestamp) {
            await membro.timeout(null, 'Undo de mute');
            sucesso = true;
            acaoDesfeita = 'Mute (timeout) removido';
          } else {
            acaoDesfeita = 'O usuário não está mutado.';
          }
          break;

        case 'ban':
          await message.guild.bans.remove(action.targetId, 'Undo de banimento');
          sucesso = true;
          acaoDesfeita = 'Banimento revertido';
          break;

        case 'warn':
          sucesso = true;
          acaoDesfeita = 'Advertência anulada';
          break;

        case 'kick':
          acaoDesfeita = 'Ações de kick não podem ser desfeitas.';
          break;

        default:
          acaoDesfeita = 'Tipo de ação não suportado para desfazer.';
          break;
      }

      if (sucesso) {
        await ModerationAction.deleteOne({ _id: action._id });

        const embed = new EmbedBuilder()
          .setTitle(`${emojis.undo || '↩️'} Ação desfeita com sucesso`)
          .setColor(colors.green)
          .setDescription(`A ação \`${action.type}\` foi revertida com sucesso.`)
          .addFields(
            { name: '👤 Usuário', value: `<@${action.targetId}> (\`${action.targetId}\`)`, inline: true },
            { name: '👮 Executor original', value: `<@${action.executorId}>`, inline: true },
            { name: '📄 Status', value: acaoDesfeita, inline: true }
          )
          .setFooter({
            text: 'Punishment • Sistema Undo',
            iconURL: message.client.user.displayAvatarURL()
          })
          .setTimestamp();

        Logger.info(`[UNDO] ${acaoDesfeita} em ${action.targetId} por ${message.author.tag}`);
        return message.channel.send({ embeds: [embed] });
      } else {
        return sendEmbed('yellow', message, acaoDesfeita);
      }

    } catch (err) {
      Logger.error(`[UNDO] Erro ao desfazer ação: ${err.stack || err.message}`);
      return sendEmbed('red', message, 'Erro ao tentar desfazer a ação. Verifique os logs.');
    }
  }
};
