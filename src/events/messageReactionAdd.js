'use strict';

/**
 * Evento: messageReactionAdd
 * Descrição: Executado quando um usuário reage a uma mensagem.
 * - Adiciona o usuário ao sorteio se reagir com 🎉
 * - Traduz o conteúdo da mensagem se reagir com uma bandeira registrada em langFlags
 */

const { EmbedBuilder } = require('discord.js');
const Giveaway = require('@models/Giveaway');
const { colors, emojis, langFlags } = require('@config');
const { translateText } = require('@services/deeplService');
const Logger = require('@logger').child({ module: 'messageReactionAdd' });

const translationCooldown = new Map();

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

      // Sorteio
      if (emoji === '🎉') {
        const giveaway = await Giveaway.findOne({
          messageId: message.id,
          status: 'ativo',
        });

        if (!giveaway) return;
        if (giveaway.participants.includes(user.id)) return;

        giveaway.participants.push(user.id);
        await giveaway.save();

        Logger.debug(`[SORTEIO] ${user.tag} (${user.id}) participou do sorteio ${giveaway.messageId}`);
        return;
      }

      // Tradução por bandeira
      const targetLang = langFlags[emoji];
      if (!targetLang || typeof targetLang !== 'string') return;
      if (!message.content || message.content.trim().length === 0) return;

      // Cooldown de 5 segundos por usuário
      const cooldownKey = `${user.id}-${message.id}`;
      if (translationCooldown.has(cooldownKey)) return;

      translationCooldown.set(cooldownKey, true);
      setTimeout(() => translationCooldown.delete(cooldownKey), 5000);

      let translated;
      try {
        translated = await translateText(message.content, targetLang);
      } catch (translationError) {
        Logger.warn(`[TRADUÇÃO] Falha na tradução: ${translationError.message}`);
        return;
      }

      const truncated = translated.length > 1024;
      const translationEmbed = new EmbedBuilder()
        .setTitle(`${emojis.trad} Tradução`)
        .setColor(colors.red)
        .addFields({
          name: `Traduzido (${targetLang})`,
          value: truncated
            ? translated.slice(0, 1021) + '...'
            : translated,
        })
        .setFooter({
          text: user.username,
          iconURL: user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await message.reply({
        embeds: [translationEmbed],
        allowedMentions: { repliedUser: false },
      }).catch((err) => {
        Logger.warn(`[TRADUÇÃO] Não foi possível enviar resposta: ${err.message}`);
      });

      // Remove a reação do usuário após a tradução
      await reaction.users.remove(user.id).catch(() => {});

    } catch (error) {
      Logger.error(`[REACTION] Erro no processamento: ${error.stack || error.message}`);
    }
  },
};
