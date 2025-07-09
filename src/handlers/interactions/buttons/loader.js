const fs = require('fs');
const path = require('path');
const Logger = require('@logger');

async function loadButtonInteractions(client) {
const buttonsPath = path.join(__dirname, '../../../../src/interactions/buttons');
const files = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));

for (const file of files) {
const filePath = path.join(buttonsPath, file);
try {
const button = require(filePath);

if (!button.customId || typeof button.execute !== 'function') {  
    Logger.warn(`[loadButtonInteractions] Botão inválido em: ${file}`);  
    continue;  
  }  

  client.buttons.set(button.customId, button);  
  Logger.info(`[loadButtonInteractions] Botão registrado: ${button.customId}`);  
} catch (err) {  
  Logger.error(`[loadButtonInteractions] Não foi possível carregar: ${file}: ${err.message}`);  
}

}
}
module.exports = {
loadButtonInteractions
};

