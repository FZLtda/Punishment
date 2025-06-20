const mongoose = require('mongoose');
const logger = require('@utils/logger');

async function connectDatabase() {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    logger.info(`[DATABASE] MongoDB conectado com sucesso: ${connection.connection.host}`);
  } catch (error) {
    logger.error(`[DATABASE] Falha ao conectar no MongoDB: ${error.message}`);
    process.exit(1);
  }
}

module.exports = connectDatabase;
