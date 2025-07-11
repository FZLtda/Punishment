'use strict';

const mongoose = require('mongoose');
const Logger = require('@logger');
const { performance } = require('perf_hooks');

/**
 * Conecta o bot ao banco de dados MongoDB.
 */
async function connectMongo() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    Logger.error('A variável de ambiente MONGO_URI não foi definida.');
    return process.exit(1);
  }

  const start = performance.now();

  try {
    await mongoose.connect(uri, {
      autoIndex: false,
      connectTimeoutMS: 10_000,
      serverSelectionTimeoutMS: 10_000,
    });

    const time = (performance.now() - start).toFixed(2);
    Logger.info(`MongoDB conectado [${mongoose.connection.name}] em ${time}ms.`);

    mongoose.connection
      .on('disconnected', () => Logger.warn('Conexão com o MongoDB encerrada.'))
      .on('reconnected', () => Logger.info('Reconectado ao MongoDB.'))
      .on('error', err => Logger.error(`Erro de conexão com o MongoDB: ${err.message}`));

  } catch (error) {
    Logger.fatal(`Erro fatal ao conectar-se ao MongoDB: ${error.stack || error.message}`);
    process.exit(1);
  }
}

module.exports = { connectMongo };
