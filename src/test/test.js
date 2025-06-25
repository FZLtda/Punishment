'use strict';

module.exports = {
  name: 'test',
  description: 'Comando de teste',
  async execute(message) {
    message.reply('✅ Funcionando!');
  }
};
