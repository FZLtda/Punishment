"use strict";

const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { colors, emojis } = require("@config");
const { sendModLog } = require("@modules/modlog");
const { sendWarning } = require("@embeds/embedWarning");
const ChannelLock = require("@models/ChannelLock");

module.exports = {
  name: "lock",
  description: "Bloqueia o canal atual para que os membros não possam enviar mensagens.",
  usage: "${currentPrefix}lock [motivo]",
  category: "Moderação",
  userPermissions: ["ManageChannels"],
  botPermissions: ["ManageChannels"],
  deleteMessage: true,

  async execute(message, args) {
    const canal = message.channel;
    const motivo = args.join(" ") || "Não especificado.";

    try {
      const everyoneRole = message.guild.roles.everyone;

      const jaBloqueado = canal.permissionOverwrites.cache
        .get(everyoneRole.id)
        ?.deny.has(PermissionsBitField.Flags.SendMessages);

      if (jaBloqueado) {
        return sendWarning(message, "Este canal já está bloqueado.");
      }

      await canal.permissionOverwrites.edit(everyoneRole, {
        SendMessages: false
      });

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.lock} Canal bloqueado`)
        .setColor(colors.red)
        .setDescription("Este canal está temporariamente bloqueado para novas mensagens.")
        .addFields(
          { name: "Motivo", value: `\`${motivo}\``, inline: true }
        )
        .setFooter({
          text: message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      const msg = await canal.send({ embeds: [embed] });

      
      await ChannelLock.findOneAndUpdate(
        { guildId: message.guild.id, channelId: canal.id },
        {
          guildId: message.guild.id,
          channelId: canal.id,
          messageId: msg.id
        },
        { upsert: true }
      );

      await sendModLog(message.guild, {
        action: "Lock",
        moderator: message.author,
        reason: motivo,
        channel: canal
      });

    } catch (error) {
      console.error(error);
      return sendWarning(
        message,
        "Não foi possível bloquear o canal devido a um erro inesperado."
      );
    }
  }
};
