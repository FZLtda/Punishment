'use strict';

const mongoose = require('mongoose');
const Logger = require('@logger');
const { performance } = require('perf_hooks');

async function connectMongo() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    Logger.error('Variável MONGO_URI não encontrada no ambiente.');
    return process.exit(1);
  }

  const startTime = performance.now();

  try {
    await mongoose.connect(uri, {
      autoIndex: false,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    });

    const connectionTime = (performance.now() - startTime).toFixed(2);
    const dbName = mongoose.connection.name;

    Logger.info(`Conectado ao MongoDB [${dbName}] em ${connectionTime}ms`);

    // Eventos de conexão
    mongoose.connection.on('disconnected', () => {
      Logger.warn('Conexão com MongoDB encerrada.');
    });

    mongoose.connection.on('reconnected', () => {
      Logger.info('Reconectado ao MongoDB.');
    });

    mongoose.connection.on('error', err => {
      Logger.error(`Erro na conexão MongoDB: ${err.message}`);
    });

  } catch (error) {
    Logger.fatal(`Falha crítica ao conectar ao MongoDB: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  connectMongo
};
