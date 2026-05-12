"use strict";

const { 
  ChannelType,
  PermissionsBitField, 
} = require("discord.js");
const { sendModLog } = require("@modules/modlog");
const { createSlowmodeEmbed } = require("@embeds");

class ChannelSlowmodeService {
  static parseTempo(tempo) {
    const match = tempo.match(/^(\d+)([smh])$/i);
    if (!match) return null;

    const valor = parseInt(match[1], 10);
    const unidade = match[2].toLowerCase();

    const multiplicador = { s: 1, m: 60, h: 3600 };
    return multiplicador[unidade] ? valor * multiplicador[unidade] : null;
  }

  static async apply({ guild, channel, moderator, tempo, reason }) {
    if (!guild || !channel) {
      throw new Error("Guild ou canal inválido para aplicar slowmode.");
    }

    if (channel.type !== ChannelType.GuildText) {
      throw new Error("Este comando só pode ser executado em canais de texto.");
    }

    if (!channel.permissionsFor(guild.members.me)
      ?.has(PermissionsBitField.Flags.ManageChannels)) {
      throw new Error("O bot não possui permissão para gerenciar canais.");
    }

    const segundos = this.parseTempo(tempo);
    if (segundos === null || segundos < 0 || segundos > 21600) {
      throw new Error("Tempo inválido. O valor deve estar entre `0s` e `6h` (21600 segundos).");
    }

    if (channel.rateLimitPerUser === segundos) {
      throw new Error(`O modo lento já está definido como \`${tempo}\` neste canal.`);
    }

    try {
      await channel.setRateLimitPerUser(segundos, reason);

      const embed = createSlowmodeEmbed(moderator, tempo, segundos, reason);
      await channel.send({ embeds: [embed] });

      await sendModLog(guild, {
        action: "Slowmode",
        target: channel,
        moderator,
        reason,
        extraFields: [
          {
            name: "Duração",
            value: segundos === 0 ? "Desativado" : `${segundos}s`,
            inline: true,
          },
        ],
      });

      console.info(`[Service: ChannelSlowmode] Slowmode aplicado no canal ${channel.id}: ${segundos}s`);
    } catch (error) {
      console.error(`[Service: ChannelSlowmode] Erro ao aplicar slowmode no canal ${channel.id}:`, error);
      throw error;
    }
  }
}

module.exports = ChannelSlowmodeService;

