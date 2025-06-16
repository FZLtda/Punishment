const mongoose = require('mongoose');
const logger = require('./logger');
require('dotenv').config();

async function connectDatabase() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info(`[DATABASE] MongoDB conectado: ${conn.connection.host}`);
  } catch (err) {
    logger.error(`[DATABASE] Falha ao conectar no MongoDB: ${err.message}`);
    process.exit(1);
  }
}

module.exports = connectDatabase;
