'use strict';

const Giveaway = require('@models/Giveaway');
const Logger = require('@logger');
const { EmbedBuilder } = require('discord.js');
const { translateText } = require('@utils/translate');
const { colors, emojis, langFlags } = require('@config');

module.exports = {
  name: 'messageReactionAdd',

  /**
   * Evento ativado quando um usuário reage a uma mensagem
   * @param {import('discord.js').MessageReaction} reaction
   * @param {import('discord.js').User} user
   */
  async execute(reaction, user) {
    if (user.bot) return;

    try {
      const mensagem = reaction.message.partial
        ? await reaction.message.fetch().catch(() => null)
        : reaction.message;
      if (!mensagem) return;

      const emoji = reaction.emoji.name;

      // Reação de sorteio
      if (emoji === '🎉') {
        const giveaway = await Giveaway.findOne({
          messageId: mensagem.id,
          status: 'ativo',
        });

        if (!giveaway) return;
        if (giveaway.participants.includes(user.id)) return;

        giveaway.participants.push(user.id);
        await giveaway.save();

        return Logger.debug(`[SORTEIO] Usuário ${user.tag} (${user.id}) entrou no sorteio ${giveaway.messageId}`);
      }

      // Tradução por bandeira
      const lang = langFlags[emoji];
      if (!lang || !mensagem.content) return;

      let resultado;
      try {
        resultado = await translateText(mensagem.content, lang);
      } catch (err) {
        return Logger.warn(`[TRADUÇÃO] Falha ao traduzir mensagem: ${err.message}`);
      }

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.trad} Tradução`)
        .setColor(colors.red)
        .addFields({
          name: `Traduzido (${lang})`,
          value: resultado.slice(0, 1024),
        })
        .setFooter({
          text: user.username,
          iconURL: user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return mensagem.reply({
        embeds: [embed],
        allowedMentions: { repliedUser: false },
      }).catch(() => {});
    } catch (err) {
      Logger.error(`[REACTION] Erro ao processar reação: ${err.stack || err.message}`);
    }
  },
};
