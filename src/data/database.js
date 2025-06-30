const mongoose = require('mongoose');
const Logger = require('@logger');

async function connect() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    Logger.success('Conectado ao MongoDB com sucesso!');
  } catch (err) {
    Logger.error(`Erro ao conectar ao MongoDB: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { connect };
