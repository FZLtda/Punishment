

'use strict';
require('module-alias/register'); // ← IMPORTANTE!

const fs = require('fs');
const path = require('path');

console.log('[DEBUG] Iniciando verificação do settings.json');

const configPath = path.join(__dirname, 'src/config/settings.json');

if (!fs.existsSync(configPath)) {
  console.error('[ERRO] settings.json não encontrado em:', configPath);
  process.exit(1);
}

try {
  const settings = require('@config');
  console.log('[DEBUG] settings:', settings);

  if (!settings.BOT_NAME) {
    console.error('[ERRO] BOT_NAME está ausente ou undefined!');
    process.exit(1);
  }

  console.log('[DEBUG] Configurações carregadas com sucesso:', settings.BOT_NAME);
} catch (err) {
  console.error('[ERRO] Falha ao carregar configurações:', err);
  process.exit(1);
}

// teste 

const { performance } = require('perf_hooks');
const ExtendedClient = require('@structures/ExtendedClient');
const logger = require('@utils/logger');
const validateEnv = require('@utils/validateEnv');
const { settings } = require('@config');

validateEnv();

let retryCount = 0;
const client = new ExtendedClient();

const startBot = async () => {
  const startTime = performance.now();

  logger.info(`[${settings.BOT_NAME}] Inicializando... (Tentativa ${retryCount + 1}/${settings.MAX_RETRIES})`);
  logger.debug(`[${settings.BOT_NAME}] Ambiente: ${process.env.NODE_ENV || 'não especificado'}`);

  try {
    await client.init();
    logger.info(`[${settings.BOT_NAME}] Estruturas carregadas com sucesso.`);
  } catch (error) {
    logger.error(`[${settings.BOT_NAME}] Falha ao carregar estruturas: ${error.message}`, {
      stack: error.stack,
    });
    return retryLater();
  }

  try {
    await client.login(process.env.TOKEN);
    const elapsed = Math.round(performance.now() - startTime);
    logger.info(`[${settings.BOT_NAME}] Login bem-sucedido. Bot online em ${elapsed}ms.`);
    retryCount = 0;
  } catch (error) {
    logger.error(`[${settings.BOT_NAME}] Erro durante o login: ${error.message}`, {
      stack: error.stack,
    });
    return retryLater();
  }
};

const retryLater = () => {
  retryCount++;

  if (retryCount < settings.MAX_RETRIES) {
    logger.warn(`[${settings.BOT_NAME}] Tentando novamente em ${settings.RETRY_DELAY / 1000}s... (${retryCount}/${settings.MAX_RETRIES})`);
    return setTimeout(startBot, settings.RETRY_DELAY);
  }

  logger.fatal(`[${settings.BOT_NAME}] Número máximo de tentativas excedido. Encerrando processo.`);
  process.exit(1);
};

const gracefulShutdown = async (signal) => {
  logger.warn(`[${settings.BOT_NAME}] Encerramento solicitado (${signal}). Liberando recursos...`);

  const shutdownTimer = setTimeout(() => {
    logger.error(`[${settings.BOT_NAME}] Encerramento forçado após timeout.`);
    process.exit(1);
  }, 10_000);

  try {
    await client.destroy();
    clearTimeout(shutdownTimer);
    logger.info(`[${settings.BOT_NAME}] Recursos liberados com sucesso.`);
    process.exit(0);
  } catch (error) {
    clearTimeout(shutdownTimer);
    logger.error(`[${settings.BOT_NAME}] Erro ao encerrar: ${error.message}`, {
      stack: error.stack,
    });
    process.exit(1);
  }
};

['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => gracefulShutdown(signal));
});

process.on('uncaughtException', (error) => {
  logger.fatal(`[${settings.BOT_NAME}] Erro não tratado: ${error.message}`, {
    stack: error.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal(`[${settings.BOT_NAME}] Rejeição não tratada: ${reason?.message || reason}`, {
    stack: reason?.stack,
    reason,
  });
  process.exit(1);
});

module.exports = startBot;
