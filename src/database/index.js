'use strict';

const mongoose = require('mongoose');
const Logger = require('@logger');
const { performance } = require('perf_hooks');

mongoose.set('strictQuery', true);
mongoose.set('autoIndex', false);

const mongoOptions = {
  autoIndex: false,
  connectTimeoutMS: 10_000,
  serverSelectionTimeoutMS: 10_000,
};

/**
 * Conecta o bot ao MongoDB.
 */
async function connectMongo() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    Logger.fatal('A variável de ambiente MONGO_URI não foi definida.');
    process.exit(1);
  }

  if (mongoose.connection.readyState === 1) {
    Logger.warn('MongoDB já está conectado. Conexão ignorada.');
    return;
  }

  const start = performance.now();

  try {
    await mongoose.connect(uri, mongoOptions);

    const time = (performance.now() - start).toFixed(2);

    Logger.info('MongoDB conectado com sucesso', {
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      timeMs: time,
    });

    mongoose.connection.removeAllListeners();

    mongoose.connection
      .on('disconnected', () => Logger.warn('Conexão com MongoDB encerrada.'))
      .on('reconnected', () => Logger.info('Reconectado ao MongoDB.'))
      .on('error', err =>
        Logger.error('Erro na conexão com MongoDB', { error: err.message })
      );

  } catch (error) {
    Logger.fatal('Erro fatal ao conectar ao MongoDB', {
      error: error.stack || error.message,
    });
    process.exit(1);
  }
}

/**
 * Encerramento seguro da conexão.
 */
async function gracefulShutdown(signal) {
  Logger.warn(`Recebido ${signal}. Encerrando MongoDB...`);

  try {
    await mongoose.connection.close();
    Logger.info('MongoDB encerrado com sucesso.');
    process.exit(0);
  } catch (err) {
    Logger.error('Erro ao encerrar MongoDB', { error: err.message });
    process.exit(1);
  }
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = { connectMongo };
