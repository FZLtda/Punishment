"use strict";

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require("discord.js");

const { emojis, colors, channels, bot } = require("@config");

/**
 * @typedef {import('discord.js').Message} Message
 */

const VERIFY_BUTTON_ID = "verify_user";

module.exports = {
  name: "regras",
  description: "Envia as regras do servidor com o novo visual v2",
  usage: ".regras",
  permissions: ["SendMessages", "ViewChannel"],
  deleteMessage: true,

  /**
   * @param {Message} message
   */
  async execute(message) {
    if (message.author.id !== bot.ownerId) {
      return;
    }

    const rulesChannel = await message.client.channels
      .fetch(channels.rules)
      .catch(() => null);

    if (!rulesChannel || rulesChannel.type !== ChannelType.GuildText) {
      return message.channel.send(
        `${emojis.attentionEmoji} Canal de regras não encontrado.`
      );
    }

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("FuncZone")
      .setThumbnail(message.guild.iconURL())
      .setDescription([
        "Regras do servidor",
        "",
        "**Seja consciente nas interações**",
        "Não compartilhe conteúdo nocivo, como vírus, pornografia ou material violento. Qualquer tipo de conteúdo prejudicial resultará em banimento imediato e permanente.",
        "",
        "**Respeite a todos**",
        "Trate moderadores e membros com respeito. Evite discussões ofensivas, provocações, desinformação ou mensagens que atrapalhem o convívio. Nosso servidor é um espaço inclusivo — mantenha o respeito sempre.",
        "",
        "**Sem divulgação ou spam**",
        "Não é permitido divulgar outros servidores, links, redes sociais, nem enviar mensagens repetitivas, emojis ou imagens em excesso (spam).",
        "",
        "**Mantenha tudo limpo e apropriado**",
        "Evite nomes, avatares, status ou perfis com conteúdo ofensivo, político, apelativo ou confuso. Use emojis e símbolos com moderação.",
        "",
        "**Importante**",
        "As punições não podem ser apeladas, portanto siga as regras com atenção.",
        "",
        "*Essas regras não cobrem todos os casos possíveis. A moderação pode agir em qualquer comportamento inadequado. Use o bom senso e mantenha o respeito.*"
      ].join("\n"));

    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(VERIFY_BUTTON_ID)
        .setLabel("Clique aqui para acessar o servidor")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(emojis.done) 
    );

    try {
      await rulesChannel.send({
        embeds: [embed],
        components: [actionRow],
      });

      if (message.channel.id !== rulesChannel.id) {
        await message.channel.send(`${emojis.successEmoji} Interface de regras enviada.`);
      }
    } catch (error) {
      console.error("[REGRAS] Erro:", error);
    }
  },
};
