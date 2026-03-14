"use strict";

const { EmbedBuilder } = require("discord.js");
const { colors, emojis } = require("@config");
const Logger = require("@logger");

/**
 * Finaliza um sorteio ativo, sorteando vencedores e atualizando a mensagem original.
 * @param {Giveaway} giveaway
 * @param {import('discord.js').Client} client
 */
async function finalizarSorteio(giveaway, client) {
  try {
    if (giveaway.status !== "ativo") {
      Logger.warn(`[SORTEIO] Tentativa de finalizar sorteio já encerrado: ${giveaway.messageId}`);
      return;
    }

    const canal = await client.channels.fetch(giveaway.channelId).catch(() => null);
    if (!canal || !canal.isTextBased()) {
      Logger.warn(`[SORTEIO] Canal inválido ou inacessível (${giveaway.channelId})`);
      return;
    }

    const mensagem = await canal.messages.fetch(giveaway.messageId).catch(() => null);
    if (!mensagem) {
      Logger.warn(`[SORTEIO] Mensagem de sorteio não encontrada (${giveaway.messageId})`);
      return;
    }

    const participantes = Array.isArray(giveaway.participants) ? [...giveaway.participants] : [];
    const ganhadores = sortearParticipantes(participantes, giveaway.winners);

    const tituloGanhadores = ganhadores.length === 1 ? "Ganhador" : "Ganhadores";

    const embedEncerrado = new EmbedBuilder()
      .setTitle("🎉 Sorteio Encerrado")
      .setColor(colors.red)
      .setTimestamp()
      .setDescription(
        ganhadores.length
          ? `**Prêmio:** ${giveaway.prize}\n**${tituloGanhadores}:** ${ganhadores.map(id => `<@${id}>`).join(", ")}`
          : `**Prêmio:** ${giveaway.prize}\n${emojis.attentionEmoji} Nenhum vencedor definido. Participações insuficientes.`
      )
      .setFooter({
        text: "Punishment",
        iconURL: client.user.displayAvatarURL()
      });

    await mensagem.edit({ embeds: [embedEncerrado] }).catch(err => {
      Logger.error(`[SORTEIO] Falha ao editar mensagem do sorteio ${giveaway.messageId}: ${err.stack || err.message}`);
    });

    // Remove todas as reações da mensagem do sorteio
    await mensagem.reactions.removeAll().catch(err => {
      Logger.warn(`[SORTEIO] Não foi possível remover as reações: ${err.message}`);
    });

    giveaway.status = "encerrado";
    await giveaway.save();

    // Envia mensagem de parabéns individual para cada ganhador
    if (ganhadores.length > 0) {
      for (const userId of ganhadores) {
        const content = `🎉 Parabéns <@${userId}>! Você ganhou o **${giveaway.prize}**!`;

        await canal.send({
          content,
          allowedMentions: { users: [userId] }
        }).catch(err => {
          Logger.warn(`[SORTEIO] Não foi possível enviar mensagem de parabéns para <@${userId}>: ${err.message}`);
        });
      }
    }

    Logger.info(`[SORTEIO] Encerrado com sucesso (${giveaway.messageId}) | Ganhadores: ${ganhadores.length}`);
  } catch (error) {
    Logger.error(`[SORTEIO] Erro ao encerrar sorteio ${giveaway.messageId}: ${error.stack || error.message}`);
  }
}

/**
 * Sorteia vencedores únicos entre os participantes.
 * @param {string[]} participantes Lista de IDs de usuários.
 * @param {number} quantidade Número de ganhadores desejado.
 * @returns {string[]} IDs dos ganhadores.
 */
function sortearParticipantes(participantes, quantidade) {
  const vencedores = new Set();
  while (vencedores.size < quantidade && participantes.length > 0) {
    const index = Math.floor(Math.random() * participantes.length);
    vencedores.add(participantes.splice(index, 1)[0]);
  }
  return Array.from(vencedores);
}

module.exports = { finalizarSorteio };
