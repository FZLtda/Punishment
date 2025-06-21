const fs = require('fs');
const path = require('path');

const buttons = {};

const aliasMap = {
  giveawayButtons: 'handleGiveawayButtons',
  termsButtons: 'handleTermsButtons',
  verifyButtons: 'handleVerifyButtons'
};

const files = fs
  .readdirSync(__dirname)
  .filter(file => file !== 'index.js' && file.endsWith('.js'));

for (const file of files) {
  const baseName = path.basename(file, '.js');
  const alias = aliasMap[baseName] || baseName;

  try {
    buttons[alias] = require(path.join(__dirname, file));
  } catch (error) {
    console.error(`[Button Handler] Falha ao carregar '${file}': ${error.message}`);
  }
}

module.exports = buttons;
