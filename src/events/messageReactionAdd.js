'use strict';

/**
 * Evento: messageReactionAdd
 * Descrição: Executado quando um usuário reage a uma mensagem.
 * - Adiciona o usuário ao sorteio se reagir com 🎉
 * - Traduz o conteúdo da mensagem se reagir com uma bandeira registrada em langFlags
 */

const { EmbedBuilder } = require('discord.js');
const Giveaway = require('@models/Giveaway');
const Logger = require('@logger');
const { translateText } = require('@utils/translate');
const { colors, emojis, langFlags } = require('@config');

module.exports = {
  name: 'messageReactionAdd',

  /**
   * Executa quando uma reação é adicionada a uma mensagem
   * @param {import('discord.js').MessageReaction} reaction - Reação adicionada
   * @param {import('discord.js').User} user - Usuário que reagiu
   */
  async execute(reaction, user) {
    if (user.bot) return;

    try {
      const message = reaction.message.partial
        ? await reaction.message.fetch().catch(() => null)
        : reaction.message;
      if (!message) return;

      const emoji = reaction.emoji.name;

      // Participação em sorteio
      if (emoji === '🎉') {
        const giveaway = await Giveaway.findOne({
          messageId: message.id,
          status: 'ativo',
        });

        if (!giveaway) return;
        if (giveaway.participants.includes(user.id)) return;

        giveaway.participants.push(user.id);
        await giveaway.save();

        Logger.debug(`[SORTEIO] Usuário ${user.tag} (${user.id}) entrou no sorteio ${giveaway.messageId}`);
        return;
      }

      // Tradução por bandeira
      const targetLang = langFlags[emoji];
      if (!targetLang || !message.content) return;

      let translated;
      try {
        translated = await translateText(message.content, targetLang);
      } catch (translationError) {
        Logger.warn(`[TRADUÇÃO] Falha ao traduzir mensagem: ${translationError.message}`);
        return;
      }

      const translationEmbed = new EmbedBuilder()
        .setTitle(`${emojis.trad} Tradução`)
        .setColor(colors.red)
        .addFields({
          name: `Traduzido (${targetLang})`,
          value: translated.slice(0, 1024),
        })
        .setFooter({
          text: user.username,
          iconURL: user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await message.reply({
        embeds: [translationEmbed],
        allowedMentions: { repliedUser: false },
      }).catch(() => {});
    } catch (error) {
      Logger.error(`[REACTION] Erro ao processar reação: ${error.stack || error.message}`);
    }
  },
};
