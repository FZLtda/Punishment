'use strict';

const TermsAgreement = require('@models/TermsAgreement');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { bot, colors } = require('@config');
const { TERMS_URL } = process.env;

/**
 * Middleware para verificar se o usuário aceitou os Termos de Uso.
 * @param {{
 *   user: import('discord.js').User,
 *   client: import('discord.js').Client,
 *   reply: (options: import('discord.js').InteractionReplyOptions | import('discord.js').MessagePayload) => Promise<any>,
 *   deferReply?: Function
 * }} context - Contexto do comando ou interação.
 * @returns {Promise<boolean>} Retorna true se o usuário já aceitou os termos, senão envia os termos e retorna false.
 */
module.exports = async function checkTerms(context) {
  try {
    const { user, client, reply } = context;

    // Verifica se já aceitou os termos
    const alreadyAccepted = await TermsAgreement.findOne({ userId: user.id });
    if (alreadyAccepted) return true;

    const termsEmbed = new EmbedBuilder()
      .setColor(colors.green)
      .setTitle('Termos de Uso')
      .setDescription([
        `Para continuar utilizando o **${bot.name}**, é necessário aceitar nossos **[Termos de Uso](${TERMS_URL})**.`
      ].join('\n'))
      .setFooter({
        text: bot.name,
        iconURL: client.user.displayAvatarURL()
      })
      .setTimestamp();

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Ler Termos de Uso')
        .setStyle(ButtonStyle.Link)
        .setURL(TERMS_URL),
      new ButtonBuilder()
        .setCustomId('terms_accept')
        .setLabel('Aceitar Termos de Uso')
        .setStyle(ButtonStyle.Success)
    );

    const responsePayload = {
      embeds: [termsEmbed],
      components: [buttons],
      allowedMentions: { repliedUser: false },
      ephemeral: true
    };

    // Envia a mensagem conforme o tipo de comando
    if (typeof reply === 'function') {
      await reply(responsePayload);
    }

    return false;
  } catch (err) {
    console.error(`[TERMS] Erro ao verificar os termos para ${context.user?.tag || 'usuário desconhecido'}:`, err);
    return false;
  }
};
