'use strict';

const { exec } = require('child_process');

/**
 * Classe utilitária para executar comandos do sistema.
 */
class CommandExecutor {
  /**
   * Executa um comando shell de forma assíncrona.
   * @param {string} command - Comando a ser executado.
   * @returns {Promise<string>} - Resultado do stdout.
   */
  static run(command) {
    return new Promise((resolve, reject) => {
      exec(command, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
          const message = stderr?.trim() || error.message;
          return reject(new Error(`[CommandExecutor] ${message}`));
        }

        resolve(stdout.trim());
      });
    });
  }
}

module.exports = CommandExecutor;
