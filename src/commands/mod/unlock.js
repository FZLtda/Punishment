"use strict";

const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { colors, emojis } = require("@config");
const { sendModLog } = require("@modules/modlog");
const { sendWarning } = require("@embeds/embedWarning");
const ChannelLock = require("@models/ChannelLock");

module.exports = {
  name: "unlock",
  description: "Desbloqueia o canal atual para que os membros possam enviar mensagens.",
  usage: "${currentPrefix}unlock [motivo]",
  category: "Moderação",
  userPermissions: ["ManageChannels"],
  botPermissions: ["ManageChannels"],
  deleteMessage: true,

  async execute(message, args) {
    const canal = message.channel;
    const motivo = args.join(" ") || "Não especificado.";

    try {
      const everyoneRole = message.guild.roles.everyone;

      
      const overwrite = canal.permissionOverwrites.cache.get(everyoneRole.id);
      const jaDesbloqueado = overwrite?.allow.has(PermissionsBitField.Flags.SendMessages);

      if (jaDesbloqueado) {
        return sendWarning(message, "Este canal já está desbloqueado.");
      }

      
      await canal.permissionOverwrites.edit(everyoneRole, {
        SendMessages: true,
      });

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.unlock} Canal desbloqueado`)
        .setColor(colors.green)
        .setDescription("Este canal foi desbloqueado com sucesso.")
        .addFields(
          { name: "Motivo", value: `\`${motivo}\``, inline: true }
        )
        .setFooter({
          text: message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      
      const lockData = await ChannelLock.findOne({
        guildId: message.guild.id,
        channelId: canal.id,
      });

      if (lockData) {
        try {
          const lockMsg = await canal.messages.fetch(lockData.messageId);
          await lockMsg.edit({ embeds: [embed] });
        } catch {
          await canal.send({ embeds: [embed] });
        }

        
        await ChannelLock.deleteOne({
          guildId: message.guild.id,
          channelId: canal.id,
        });
      } else {
        await canal.send({ embeds: [embed] });
      }

      await sendModLog(message.guild, {
        action: "Unlock",
        moderator: message.author,
        reason: motivo,
        channel: canal,
      });

    } catch (error) {
      console.error(error);
      return sendWarning(
        message,
        "Não foi possível desbloquear o canal devido a um erro inesperado.",
      );
    }
  },
};
