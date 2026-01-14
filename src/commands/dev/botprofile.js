'use strict';

const { bot, emojis } = require('@config');
const { sendWarning } = require('@embeds/embedWarning');

module.exports = {
  name: 'botprofile',
  description: 'Altera o nome, avatar ou apelido do bot.',
  usage: '${currentPrefix}botprofile <name|avatar|nick> <valor>',
  category: 'Administrador',
  deleteMessage: true,

  /**
   * Altera informações do perfil do bot.
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
  async execute(message, args) {
    if (message.author.id !== bot.ownerId) return;

    const action = args[0]?.toLowerCase();
    const value = args.slice(1).join(' ').trim();

    if (!action) {
      return sendWarning(
        message,
        'Você precisa informar a ação: name, avatar ou nick.'
      );
    }

    if (!value) {
      return sendWarning(
        message,
        'Você precisa informar um valor válido para a alteração.'
      );
    }

    try {
      switch (action) {
        case 'name': {
          if (value.length < 2 || value.length > 32) {
            return sendWarning(
              message,
              'O nome do bot deve conter entre 2 e 32 caracteres.'
            );
          }

          await message.client.user.setUsername(value);

          return message.channel.send({
            content: `${emojis.done} Nome do bot alterado para **${value}**.`,
          });
        }

        case 'avatar': {
          if (!/^https?:\/\/.+\.(png|jpe?g|webp)$/i.test(value)) {
            return sendWarning(
              message,
              'Forneça uma URL válida de imagem (png, jpg ou webp).'
            );
          }

          await message.client.user.setAvatar(value);

          return message.channel.send({
            content: `${emojis.done} Avatar do bot atualizado com sucesso.`,
          });
        }

        case 'nick': {
          if (!message.guild) {
            return sendWarning(
              message,
              'Este comando precisa ser executado dentro de um servidor.'
            );
          }

          const botMember = await message.guild.members
            .fetch(message.client.user.id)
            .catch(() => null);

          if (!botMember) {
            return sendWarning(
              message,
              'Não foi possível localizar o bot neste servidor.'
            );
          }

          if (!botMember.permissions.has('ChangeNickname')) {
            return sendWarning(
              message,
              'O bot não possui permissão para alterar o próprio apelido.'
            );
          }

          await botMember.setNickname(value);

          return message.channel.send({
            content: `${emojis.done} Apelido do bot alterado para **${value}** neste servidor.`,
          });
        }

        default:
          return sendWarning(
            message,
            'Ação inválida. Use: name, avatar ou nick.'
          );
      }
    } catch (error) {
      console.error('[botprofile] Erro ao alterar perfil:', error);

      return sendWarning(
        message,
        'Não foi possível alterar o perfil do bot. Limites ou permissões podem ter sido atingidos.'
      );
    }
  },
};
