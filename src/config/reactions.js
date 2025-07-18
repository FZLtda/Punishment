/**
 * Adiciona reações de bandeiras em uma mensagem.
 * @param {import('discord.js').Message} message - A mensagem a ser reagida.
 * @param {string[]} flags - Lista de emojis de bandeiras.
 */
async function reactWithFlags(message, flags) {
  for (const flag of flags) {
    await message.react(flag).catch(() => null);
  }
}

/**
 * Envia uma resposta com embed referenciando a mensagem original.
 * @param {import('discord.js').TextChannel} channel
 * @param {import('discord.js').Message} replied - Mensagem original.
 * @param {import('discord.js').EmbedBuilder} embed
 * @param {Function} fallbackFn - Função alternativa caso falhe.
 */
async function replyWithEmbed(channel, replied, embed, fallbackFn) {
  try {
    await channel.send({
      embeds: [embed],
      allowedMentions: { repliedUser: false },
      messageReference: { messageId: replied.id },
    });
  } catch {
    if (typeof fallbackFn === 'function') {
      await fallbackFn();
    }
  }
}

module.exports = { reactWithFlags, replyWithEmbed };
