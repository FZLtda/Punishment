'use strict';

require('module-alias/register');
require('dotenv').config();

const bootstrap = require('@bot/bootstrap');

// Tratamento global de exceções e sinais
process
  .on('uncaughtException', (err) => {
    console.error('[FATAL] Exceção não capturada:', err);
    process.exit(1);
  })
  .on('unhandledRejection', (reason) => {
    console.error('[FATAL] Rejeição não tratada:', reason);
    process.exit(1);
  })
  .on('SIGINT', () => {
    console.warn('[WARN] Processo interrompido com SIGINT');
    process.exit(0);
  })
  .on('SIGTERM', () => {
    console.warn('[WARN] Processo interrompido com SIGTERM');
    process.exit(0);
  });

// Função isolada de inicialização
(async () => {
  try {
    await bootstrap();
  } catch (error) {
    console.error('[FATAL] Erro crítico durante a inicialização:', error);
    process.exit(1);
  }
})();
