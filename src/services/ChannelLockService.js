"use strict";

const { PermissionsBitField } = require("discord.js");
const { sendModLog } = require("@modules/modlog");
const ChannelLock = require("@models/ChannelLock");
const { createLockEmbed, createUnlockEmbed } = require("@embeds");

class ChannelLockService {
  /**
   * Valida contexto antes de executar lock/unlock
   */
  static _validateContext(guild, channel) {
    if (!guild || !channel) {
      throw new Error("Guild ou canal inválido.");
    }

    const botMember = guild.members.me;
    if (!botMember) {
      throw new Error("Bot não encontrado no servidor.");
    }

    if (!channel.permissionsFor(botMember)
      ?.has(PermissionsBitField.Flags.ManageChannels)) {
      throw new Error("O bot não possui permissão para gerenciar canais.");
    }

    return guild.roles.everyone;
  }

  /**
   * Bloqueia o canal
   */
  static async lock({ guild, channel, moderator, reason }) {
    const everyoneRole = this._validateContext(guild, channel);
    const motivo = reason?.trim() || "Não especificado.";

    try {
      await channel.permissionOverwrites.edit(everyoneRole, { SendMessages: false });

      const embed = createLockEmbed(moderator, motivo);
      const msg = await channel.send({ embeds: [embed] });

      await ChannelLock.findOneAndUpdate(
        { guildId: guild.id, channelId: channel.id },
        { guildId: guild.id, channelId: channel.id, messageId: msg.id },
        { upsert: true }
      );

      await sendModLog(guild, {
        action: "Lock",
        moderator,
        reason: motivo,
        channel
      });

      console.info(`[Service: ChannelLock] Canal ${channel.id} bloqueado com sucesso.`);

    } catch (error) {
      console.error(`[Service: ChannelLock] Erro ao bloquear canal ${channel.id}:`, error);
      throw new Error("Falha ao bloquear canal.");
    }
  }

  /**
   * Desbloqueia o canal
   */
  static async unlock({ guild, channel, moderator, reason }) {
    const everyoneRole = this._validateContext(guild, channel);
    const motivo = reason?.trim() || "Não especificado.";

    try {
      await channel.permissionOverwrites.edit(everyoneRole, { SendMessages: true });

      const embed = createUnlockEmbed(moderator, motivo);

      const lockData = await ChannelLock.findOne({
        guildId: guild.id,
        channelId: channel.id,
      });

      if (lockData) {
        try {
          const lockMsg = await channel.messages.fetch(lockData.messageId);
          await lockMsg.edit({ embeds: [embed] });
        } catch (err) {
          console.warn(`[Service: ChannelLock] Mensagem de lock não encontrada para canal ${channel.id}:`, err);
          await channel.send({ embeds: [embed] });
        }

        await ChannelLock.deleteOne({
          guildId: guild.id,
          channelId: channel.id,
        });
      } else {
        await channel.send({ embeds: [embed] });
      }

      await sendModLog(guild, {
        action: "Unlock",
        moderator,
        reason: motivo,
        channel
      });

      console.info(`[Service: ChannelLock] Canal ${channel.id} desbloqueado com sucesso.`);

    } catch (error) {
      console.error(`[Service: ChannelLock] Erro ao desbloquear canal ${channel.id}:`, error);
      throw new Error("Falha ao desbloquear canal.");
    }
  }
}

module.exports = ChannelLockService;
