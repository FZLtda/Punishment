'use strict';

/**
 * Evento: messageReactionAdd
 * Descrição:
 * - Adiciona usuário ao sorteio 🎉
 * - Traduz mensagens por bandeiras
 * 🔒 Protegido pelo sistema de Global Ban
 */

const { EmbedBuilder } = require('discord.js');
const Giveaway = require('@models/Giveaway');
const { colors, emojis, langFlags } = require('@config');
const { translateText } = require('@services/deeplService');
const checkGlobalBan = require('@middlewares/checkGlobalBan');
const Logger = require('@logger').child({ module: 'messageReactionAdd' });

const translationCooldown = new Map();

module.exports = {
  name: 'messageReactionAdd',

  async execute(reaction, user) {
    if (user.bot) return;

    try {
      const message = reaction.message.partial
        ? await reaction.message.fetch().catch(() => null)
        : reaction.message;

      if (!message || !message.guild) return;

      const isBlocked = await checkGlobalBan({
        author: user,
        guild: message.guild,
        channel: message.channel,
        client: message.client,
        reply: () => null,
      });

      if (isBlocked) {
        Logger.warn(
          `[GLOBAL BAN] ${user.tag} tentou usar sistemas por reação.`
        );
        return;
      }

      const emoji = reaction.emoji.name;

      // 🎉 Sistema de sorteio
      
      if (emoji === '🎉') {
        const giveaway = await Giveaway.findOne({
          messageId: message.id,
          status: 'ativo',
        });

        if (!giveaway) return;
        if (giveaway.participants.includes(user.id)) return;

        giveaway.participants.push(user.id);
        await giveaway.save();

        Logger.info(
          `[SORTEIO] ${user.tag} (${user.id}) entrou no sorteio ${giveaway.messageId}`
        );
        return;
      }

      // 🌍 Sistema de tradução
      
      const targetLang = langFlags[emoji];
      if (!targetLang || typeof targetLang !== 'string') return;
      if (!message.content || message.content.trim().length === 0) return;

      const cooldownKey = `${user.id}-${message.id}`;
      if (translationCooldown.has(cooldownKey)) return;

      translationCooldown.set(cooldownKey, true);
      setTimeout(() => translationCooldown.delete(cooldownKey), 5000);

      let translated;
      try {
        translated = await translateText(message.content, targetLang);
      } catch (translationError) {
        Logger.warn(
          `[TRADUÇÃO] Falha na tradução: ${translationError.message}`
        );
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
        Logger.warn(
          `[TRADUÇÃO] Não foi possível enviar resposta: ${err.message}`
        );
      });

      // Remove a reação após traduzir
      await reaction.users.remove(user.id).catch(() => {});

    } catch (error) {
      Logger.error(
        `[REACTION] Erro no processamento: ${error.stack || error.message}`
      );
    }
  },
};
