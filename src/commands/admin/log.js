"use strict";

const { 
  ChannelType, 
  EmbedBuilder, 
  PermissionsBitField,
} = require("discord.js");
const GuildSettings = require("@models/GuildSettings");
const { emojis, colors } = require("@config");
const { sendWarning } = require("@embeds");

module.exports = {
  name: "log",
  description: "Gerencia o sistema de logs.",
  usage: "${currentPrefix}log <set|off|status>",
  aliases: ["logs", "setlog", "setlogs"],
  category: "Administração",
  userPermissions: ["Administrator"],
  botPermissions: ["ManageChannels"],
  deleteMessage: true,

  async execute(message, args) {

    const subcommand = args[0]?.toLowerCase();

    if (!subcommand) {
      return sendWarning(
        message,
        "Subcomando não informado. Utilize set, off ou status."
      );
    }

    try {

      if (subcommand === "set") {

        const channel = message.mentions.channels.first();

        if (!channel) {
          return sendWarning(
            message,
            "Nenhum canal foi informado. Mencione um canal de texto válido."
          );
        }

        if (channel.type !== ChannelType.GuildText) {
          return sendWarning(
            message,
            "O canal informado não é um canal de texto válido."
          );
        }

        const permissions = channel.permissionsFor(message.guild.members.me);

        if (!permissions?.has(PermissionsBitField.Flags.SendMessages)) {
          return sendWarning(
            message,
            "Não tenho permissão para enviar mensagens no canal informado."
          );
        }

        await GuildSettings.findOneAndUpdate(
          { guildId: message.guild.id },
          {
            logChannelId: channel.id,
            logEnabledBy: message.author.id,
            logEnabledAt: new Date(),
            logDisabledBy: null,
            logDisabledAt: null
          },
          {
            upsert: true,
            new: true
          }
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

      if (subcommand === "off") {

        const data = await GuildSettings.findOne({ guildId: message.guild.id });

        if (!data?.logChannelId) {
          return sendWarning(
            message,
            "O sistema de logs já se encontra desativado neste servidor."
          );
        }

        await GuildSettings.findOneAndUpdate(
          { guildId: message.guild.id },
          {
            logChannelId: null,
            logDisabledBy: message.author.id,
            logDisabledAt: new Date()
          }
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

      if (subcommand === "status") {

        const data = await GuildSettings.findOne({ guildId: message.guild.id });

        const embed = new EmbedBuilder()
          .setTitle(`${emojis.recent} Registro de Moderação`);

        if (!data) {

          embed
            .setColor(colors.red)
            .addFields(
              {
                name: "Estado",
                value: `${emojis.errorEmoji} Desativado`,
                inline: true
              },
              {
                name: "Canal",
                value: "Nenhum",
                inline: true
              },
              {
                name: "Status",
                value: "O sistema de logs nunca foi configurado neste servidor.",
                inline: false
              }
            );

        } else {

          const active = Boolean(data.logChannelId);


          if (active) {

            embed
              .setColor(colors.green)
              .addFields(
                {
                  name: "Estado",
                  value: `${emojis.successEmoji} Ativo`,
                  inline: true
                },
                {
                  name: "Canal",
                  value: `<#${data.logChannelId}>`,
                  inline: true
                },
                {
                  name: "Ativado por",
                  value: data.logEnabledBy
                    ? `<@${data.logEnabledBy}>`
                    : "Desconhecido",
                  inline: true
                },
                {
                  name: "Data de ativação",
                  value: data.logEnabledAt
                    ? `<t:${Math.floor(data.logEnabledAt.getTime() / 1000)}:f>`
                    : "Não disponível",
                  inline: true
                }
              );

          }

          else {

            embed
              .setColor(colors.red)
              .addFields(
                {
                  name: "Estado",
                  value: `${emojis.errorEmoji} Desativado`,
                  inline: true
                },
                {
                  name: "Desativado por",
                  value: data.logDisabledBy
                    ? `<@${data.logDisabledBy}>`
                    : "Desconhecido",
                  inline: true
                },
                {
                  name: "Data de desativação",
                  value: data.logDisabledAt
                    ? `<t:${Math.floor(data.logDisabledAt.getTime() / 1000)}:f>`
                    : "Não disponível",
                  inline: true
                }
              );

          }

        }

        embed
          .setFooter({
            text: `${message.author.tag}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true })
          })
          .setTimestamp();

        return message.channel.send({ embeds: [embed] });

      }

      return sendWarning(
        message,
        "Subcomando inválido. Utilize set, off ou status."
      );

    } catch (error) {

      console.error("[LOG COMMAND ERROR]", error);

      return sendWarning(
        message,
        "Não foi possível executar o comando no momento. Tente novamente mais tarde."
      );

    }

  }
};
