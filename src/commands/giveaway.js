const { EmbedBuilder } = require('discord.js'); const { yellow } = require('../config/colors.json'); 
const { icon_attention } = require('../config/emoji.json'); 
const { parseDuration, sendErrorEmbed } = require('../utils/messageUtils'); 
const { createGiveaway, scheduleGiveawayEnd } = require('../utils/giveawayManager');

module.exports = { name: 'giveaway', description: 'Gerencia sorteios no servidor.', 
                  usage: '.giveaway start <tempo> <ganhadores> <prêmio>', 
                  userPermissions: ['SendMessages'], 
                  botPermissions: ['SendMessages'], 
                  deleteMessage: true,

async execute(message, args) { if (args[0] !== 'start') { 
  
  return sendErrorEmbed( message, 'Uso correto: .giveaway start <tempo> <ganhadores> <prêmio>' ); }

const [_, timeInput, winnersRaw, ...prizeArr] = args;
const winnerCount = parseInt(winnersRaw);
const prize = prizeArr.join(' ');

if (!timeInput || isNaN(winnerCount) || !prize) {
  return sendErrorEmbed(
    message,
    'Uso correto: .giveaway start <tempo> <ganhadores> <prêmio>'
  );
}

const durationMs = parseDuration(timeInput);
if (!durationMs) {
  return sendErrorEmbed(
    message,
    'Formato de tempo inválido! Use 1m, 1h ou 1d.'
  );
}

try {
  const giveawayMessage = await createGiveaway({
    client: message.client,
    guild: message.guild,
    channel: message.channel,
    durationMs,
    winnerCount,
    prize
  });

  message.delete().catch(() => null);

  scheduleGiveawayEnd({
    messageId: giveawayMessage.id,
    guildId: message.guild.id,
    client: message.client,
    timeout: durationMs
  });
} catch (err) {
  console.error(`[ERRO] Sorteio: ${err}`);
  return sendErrorEmbed(
    message,
    'Ocorreu um erro ao iniciar o sorteio. Por favor, tente novamente.'
  );
}

} };

