const mongoose = require('mongoose');
const Logger = require('@logger/index');

async function connectMongo() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    Logger.error('MONGO_URI não foi definido no ambiente.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    Logger.success('Conectado ao MongoDB com sucesso!');
    mongoose.connection.on('disconnected', () =>
      Logger.warn('Conexão MongoDB foi encerrada.')
    );
  } catch (error) {
    Logger.error(`Falha ao conectar ao MongoDB: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { connectMongo };
