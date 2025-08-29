'use strict';

const { sendToWebhook } = require('@logger/webhook');

/**
 * Sobrescreve os métodos do logger para adicionar
 * envio ao Discord e comportamento customizado
 */
function applyOverrides(baseLogger, levels) {
  for (const [level] of Object.entries(levels)) {
    baseLogger[level] = (message, error) => {
      const isError = error instanceof Error;
      const formattedMessage = isError
        ? `${message}\n${error.stack}`
        : typeof message === 'string'
        ? message
        : JSON.stringify(message, null, 2);

      baseLogger.log({ level, message: formattedMessage });

      // Envia logs críticos ao Discord
      if (['error', 'fatal'].includes(level)) {
        sendToWebhook(level, formattedMessage);
      }

      // Fatal derruba a aplicação
      if (level === 'fatal') process.exit(1);
    };
  }
}

module.exports = { applyOverrides };
