'use strict';

const Giveaway = require('@models/Giveaway');
const Logger = require('@logger');

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
      // Garante que os dados da mensagem estejam completos
      const mensagem = reaction.message.partial ? await reaction.message.fetch().catch(() => null) : reaction.message;
      if (!mensagem) return;

      // Ignora se a reação não for 🎉 (suporte apenas ao emoji padrão)
      if (reaction.emoji.name !== '🎉') return;

      // Busca sorteio ativo relacionado à mensagem
      const giveaway = await Giveaway.findOne({
        messageId: mensagem.id,
        status: 'ativo'
      });

      if (!giveaway) return;

      // Impede registros duplicados
      if (giveaway.participants.includes(user.id)) return;

      // Adiciona participante e salva no banco
      giveaway.participants.push(user.id);
      await giveaway.save();

      Logger.debug(`[SORTEIO] Usuário ${user.tag} (${user.id}) entrou no sorteio ${giveaway.messageId}`);
    } catch (err) {
      Logger.error(`[REACTION] Erro ao registrar participante: ${err.stack || err.message}`);
    }
  }
};
