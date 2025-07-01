'use strict';

require('module-alias/register');
require('dotenv').config();

const bootstrap = require('@bot/bootstrap');

// Tratamento global de exceções críticas
process
  .on('uncaughtException', err => {
    console.error('[FATAL][uncaughtException] Erro não capturado:', err);
    process.exit(1);
  })
  .on('unhandledRejection', reason => {
    console.error('[FATAL][unhandledRejection] Promessa rejeitada sem tratamento:', reason);
    process.exit(1);
  });

// Tratamento de sinais do sistema
['SIGINT', 'SIGTERM'].forEach(sig => {
  process.on(sig, () => {
    console.warn(`[WARN] Sinal recebido: ${sig} → Encerrando processo.`);
    process.exit(0);
  });
});

// Inicialização principal
(async () => {
  try {
    console.info('[BOOT] Iniciando bootstrap do bot...');
    await bootstrap();
    console.info('[BOOT] Bootstrap concluído. Bot operacional.');
  } catch (error) {
    console.error('[FATAL] Falha durante a inicialização:', error);
    process.exit(1);
  }
})();
