"use strict";

const { 
  EmbedBuilder, 
  ChannelType, 
  PermissionFlagsBits 
} = require("discord.js");
const { sendWarning } = require("@embeds");
const { getPrefix } = require("@helpers");
const { colors, emojis } = require("@config");
const { Giveaway } = require("@models");
const logger = require("@logger");
const ms = require("ms");

module.exports = {
  name: "sorteio",
  description: "Inicia um sorteio em um canal.",
  usage: "sorteio <prêmio> <vencedores> <duração> [#canal]",
  category: "Utilidades",
  userPermissions: [PermissionFlagsBits.ManageMessages],
  botPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions],
  deleteMessage: true,

  async execute(message, args) {
    const prefix = await getPrefix(message.guild?.id);

    if (args.length < 3) {
      return sendWarning(message, `Uso correto: ${prefix}${this.usage}`);
    }

    const { canal, premio, vencedores, duracao } = this.parseArgs(message, args);
    if (!premio || isNaN(vencedores) || vencedores <= 0 || !duracao || duracao < 10000) {
      return sendWarning(message, "Parâmetros inválidos. Preencha todos corretamente.");
    }

    if (canal.type !== ChannelType.GuildText) {
      return sendWarning(message, "Mencione um canal de texto válido.");
    }

    const terminaEm = new Date(Date.now() + duracao);

    const embed = this.createEmbed(message, premio, vencedores, terminaEm);

    try {
      const sorteioMsg = await canal.send({ embeds: [embed] });
      await sorteioMsg.react("🎉");

      await Giveaway.create({
        guildId: message.guild.id,
        channelId: canal.id,
        messageId: sorteioMsg.id,
        prize: premio,
        winners: vencedores,
        endsAt: terminaEm,
        createdBy: message.author.id
      });

      logger.info(
        `[SORTEIO] Criado | Por: ${message.author.tag} | Prêmio: "${premio}" | Canal: ${canal.name}`
      );

      if (canal.id !== message.channel.id) {
        const confirmMsg = await message.channel.send({
          content: `${emojis.done} Sorteio criado e postado em ${canal}!`,
          allowedMentions: { repliedUser: false }
        });

        setTimeout(() => {
          confirmMsg.delete().catch(() => {});
        }, 5000);

        return;
      }

    } catch (err) {
      logger.error(`[SORTEIO] Erro: ${err.stack || err.message}`);
      return sendWarning(message, "Erro interno ao criar sorteio. Tente novamente.");
    }
  },

  parseArgs(message, args) {
    let canal;
    let duracaoRaw;
    let vencedoresRaw;
    let premioArgs;

    const canalRegex = /^<#\d+>$/;

    if (canalRegex.test(args[args.length - 1])) {
      const canalMention = args[args.length - 1];
      const canalId = canalMention.replace(/[<#>]/g, "");
      canal = message.guild.channels.cache.get(canalId);

      duracaoRaw = args[args.length - 2];
      vencedoresRaw = args[args.length - 3];
      premioArgs = args.slice(0, args.length - 3);
    } else {
      canal = message.channel;

      duracaoRaw = args[args.length - 1];
      vencedoresRaw = args[args.length - 2];
      premioArgs = args.slice(0, args.length - 2);
    }

    const premio = premioArgs.join(" ");
    const vencedores = parseInt(vencedoresRaw, 10);
    const duracao = ms(duracaoRaw);

    return { canal, premio, vencedores, duracao };
  },

  createEmbed(message, premio, vencedores, terminaEm) {
    const plural = vencedores === 1 ? "ganhador" : "ganhadores";

    return new EmbedBuilder()
      .setTitle("🎉 Novo Sorteio!")
      .setDescription([
        `**Prêmio:** ${premio}`,
        "**Participe:** Reaja com 🎉",
        `**Termina:** <t:${Math.floor(terminaEm.getTime() / 1000)}:R>`
      ].join("\n"))
      .setColor(colors.primary || colors.red)
      .setFooter({
        text: `Ser${vencedores === 1 ? "á" : "ão"} ${vencedores} ${plural}`,
        iconURL: message.client.user.displayAvatarURL()
      })
      .setTimestamp();
  }
};
