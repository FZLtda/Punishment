const mongoose = require('mongoose');
const Logger = require('@logger');
const { emojis } = require('@config');

async function connectMongo() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    Logger.error('MONGO_URI não foi definida no ambiente.');
    return process.exit(1);
  }

  try {
    await mongoose.connect(uri);

    Logger.success('Conectado ao MongoDB com sucesso!');

    mongoose.connection.on('disconnected', () =>
      Logger.warn('Conexão MongoDB foi encerrada.')
    );

    mongoose.connection.on('error', err =>
      Logger.error(`Erro na conexão MongoDB: ${err.message}`)
    );
  } catch (error) {
    Logger.error(`Falha ao conectar ao MongoDB: ${error.message}`);
    return process.exit(1);
  }
}

module.exports = { connectMongo };
