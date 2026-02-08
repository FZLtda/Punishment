'use strict';

const { ChannelType, EmbedBuilder, PermissionsBitField } = require('discord.js');
const GuildSettings = require('@models/GuildSettings');
const { emojis, colors } = require('@config');
const { sendWarning } = require('@embeds/embedWarning');

module.exports = {
  name: 'log',
  description: 'Gerencia o sistema de logs.',
  usage: '${currentPrefix}log <set|off|status>',
  aliases: ['logs', 'setlog', 'setlogs'],
  category: 'Administração',
  userPermissions: ['Administrator'],
  botPermissions: ['ManageChannels'],
  deleteMessage: true,

  async execute(message, args) {
    const subcommand = args[0]?.toLowerCase();

    if (!subcommand)
      return sendWarning(
        message,
        'Subcomando não informado. Utilize set, off ou status.'
      );

    try {
      
      if (subcommand === 'set') {
        const channel = message.mentions.channels.first();

        if (!channel)
          return sendWarning(
            message,
            'Nenhum canal foi informado. Mencione um canal de texto válido.'
          );

        if (channel.type !== ChannelType.GuildText)
          return sendWarning(
            message,
            'O canal informado não é um canal de texto válido.'
          );

        const botPermissions = channel.permissionsFor(message.guild.members.me);

        if (!botPermissions?.has(PermissionsBitField.Flags.SendMessages))
          return sendWarning(
            message,
            'Não tenho permissão para enviar mensagens no canal informado.'
          );

        await GuildSettings.findOneAndUpdate(
          { guildId: message.guild.id },
          { logChannelId: channel.id },
          { upsert: true, new: true }
        );

        const sentMessage = await message.channel.send({
          content: `${emojis.successEmoji} Sistema de logs ativado em ${channel}.`,
          allowedMentions: { parse: [] }
        });

        setTimeout(() => {
          sentMessage.delete().catch(() => null);
        }, 6000);

        return;
      }

      
      if (subcommand === 'off') {
        const data = await GuildSettings.findOne({ guildId: message.guild.id });

        if (!data?.logChannelId)
          return sendWarning(
            message,
            'O sistema de logs já se encontra desativado neste servidor.'
          );

        await GuildSettings.findOneAndUpdate(
          { guildId: message.guild.id },
          { $unset: { logChannelId: '' } }
        );

        const sentMessage = await message.channel.send({
          content: `${emojis.errorEmoji} Sistema de logs desativado com sucesso.`,
          allowedMentions: { parse: [] }
        });

        setTimeout(() => {
          sentMessage.delete().catch(() => null);
        }, 6000);

        return;
      }

      
      if (subcommand === 'status') {
        const data = await GuildSettings.findOne({ guildId: message.guild.id });
        const active = Boolean(data?.logChannelId);

        const embed = new EmbedBuilder()
          .setColor(active ? colors.green : colors.red)
          .setTitle('📑 Sistema de Logs')
          .addFields(
            {
              name: 'Estado',
              value: active
                ? `${emojis.successEmoji} Ativo`
                : `${emojis.errorEmoji} Desativado`,
              inline: true
            },
            {
              name: 'Canal',
              value: active ? `<#${data.logChannelId}>` : 'Nenhum',
              inline: true
            }
          )
          .setFooter({ text: `Servidor: ${message.guild.name}` });

        return message.channel.send({ embeds: [embed] });
      }

      
      return sendWarning(
        message,
        'Subcomando inválido. Utilize set, off ou status.'
      );
    } catch (error) {
      console.error('[LOG COMMAND ERROR]', error);

      return sendWarning(
        message,
        'Não foi possível executar o comando no momento. Tente novamente mais tarde.'
      );
    }
  }
};
