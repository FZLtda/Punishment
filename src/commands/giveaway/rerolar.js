'use strict';

const { EmbedBuilder } = require('discord.js');
const { sendWarning } = require('@embeds/embedWarning');
const { colors, emojis } = require('@config');
const Giveaway = require('@models/Giveaway');
const logger = require('@logger');

module.exports = {
  name: 'rerolar',
  description: 'Sorteia novamente os vencedores de um sorteio encerrado.',
  usage: '${currentPrefix}rerolar <ID da mensagem>',
  category: 'Utilidades',
  userPermissions: ['ManageMessages'],
  botPermissions: ['SendMessages'],
  deleteMessage: true,

  async execute(message, args) {
    const msgId = args[0];

    // Validação de ID
    if (!msgId || !/^\d{17,20}$/.test(msgId)) {
      logger.warn(`[REROLL] ID inválido fornecido por ${message.author.tag} (${message.author.id})`);
      return sendWarning(message, 'Forneça um ID de mensagem válido para rerolar o sorteio.');
    }

    let sorteio;
    try {
      sorteio = await Giveaway.findOne({ messageId: msgId, status: 'encerrado' });
    } catch (error) {
      logger.error(`[REROLL] Erro ao buscar sorteio | ID: ${msgId} | Erro: ${error.message}`);
      return sendWarning(message, 'Ocorreu um erro interno ao buscar o sorteio.');
    }

    if (!sorteio) {
      logger.warn(`[REROLL] Sorteio encerrado não encontrado para o ID ${msgId}`);
      return sendWarning(message, 'Não foi encontrado nenhum sorteio com esse ID.');
    }

    const participantes = Array.isArray(sorteio.participants) ? [...sorteio.participants] : [];
    const ganhadores = [];

    // Seleção dos ganhadores
    if (participantes.length >= sorteio.winners) {
      for (let i = 0; i < sorteio.winners; i++) {
        const index = Math.floor(Math.random() * participantes.length);
        const escolhido = participantes.splice(index, 1)[0];
        if (escolhido) ganhadores.push(`<@${escolhido}>`);
      }
    }

    const plural = ganhadores.length === 1 ? 'vencedor' : 'vencedores';

    const rerollEmbed = new EmbedBuilder()
      .setTitle('🔁 Sorteio Rerolado')
      .setDescription(
        ganhadores.length
          ? `**Prêmio:** ${sorteio.prize}\n**Novos ${plural}:** ${ganhadores.join(', ')}`
          : `**Prêmio:** ${sorteio.prize}\n${emojis.attentionEmoji} Nenhum participante suficiente para rerolar.`
      )
      .setColor(colors.red)
      .setTimestamp()
      .setFooter({ text: 'Punishment', iconURL: message.client.user.displayAvatarURL() });

    logger.info(
      `[REROLL] Sorteio rerolado por ${message.author.tag} (${message.author.id}) | ID: ${msgId} | Ganhadores: ${ganhadores.length}`
    );

    return message.channel.send({ embeds: [rerollEmbed], allowedMentions: { parse: [] } });
  }
};
