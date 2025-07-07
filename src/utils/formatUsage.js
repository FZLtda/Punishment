'use strict';

/**
 * Substitui placeholders no campo `usage` de um comando por valores reais, como o prefixo atual.
 * Atualmente suporta:
 *   - ${currentPrefix}
 *   - ${commandName} (futuramente)
 *
 * @param {string} usage - String contendo o usage, ex: '${currentPrefix}ban <@usuário> [motivo]'
 * @param {string} prefix - Prefixo atual do servidor
 * @param {Object} [options={}] - Opções futuras de substituição (como commandName)
 * @returns {string} - Uso formatado com prefixo aplicado
 */
function formatUsage(usage, prefix, options = {}) {
  if (typeof usage !== 'string' || usage.length === 0)
    return '[Usage indisponível]';

  if (typeof prefix !== 'string' || prefix.length === 0)
    prefix = '.';

  let result = usage;

  // Substituir ${currentPrefix}
  result = result.replace(/\$\{currentPrefix\}/g, prefix);

  // Substituições futuras
  if (options.commandName) {
    result = result.replace(/\$\{commandName\}/g, options.commandName);
  }

  return result;
}

module.exports = { formatUsage };
