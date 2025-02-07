const logger = require('./logger.js');

function monitorBot() {
  setInterval(() => {
    logger.info('Monitorando o estado do bot...');
  }, 60000);
}

module.exports = monitorBot;