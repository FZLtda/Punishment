'use strict';

const Giveaway = require('@models/Giveaway');

module.exports = {
  name: 'messageReactionAdd',
  
  /**
   * Evento ativado quando um usuário reage a uma mensagem
   * @param {import('discord.js').MessageReaction} reaction
   * @param {import('discord.js').User} user
   */
  async execute(reaction, user) {
    try {
      if (user.bot || reaction.emoji.name !== '🎉') return;

      const mensagem = reaction.message.partial ? await reaction.message.fetch() : reaction.message;
      const giveaway = await Giveaway.findOne({
        messageId: mensagem.id,
        status: 'ativo'
      });

      if (!giveaway) return;

      if (!giveaway.participants.includes(user.id)) {
        giveaway.participants.push(user.id);
        await giveaway.save();
      }
    } catch (err) {
      console.error(`[REACTION] Erro ao registrar participante: ${err.stack || err.message}`);
    }
  }
};
