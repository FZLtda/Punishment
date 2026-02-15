'use strict';

/**
 * Converte duração em formato 1m, 2h, 3d para milissegundos.
 * @param {string} tempo
 * @returns {number|null}
 */
function convertToMilliseconds(tempo) {
  const regex = /^(\d+)([smhd])$/;
  const match = tempo.match(regex);
  if (!match) return null;

  const valor = parseInt(match[1], 10);
  const unidade = match[2];

  switch (unidade) {
    case 's': return valor * 1000;
    case 'm': return valor * 60 * 1000;
    case 'h': return valor * 60 * 60 * 1000;
    case 'd': return valor * 24 * 60 * 60 * 1000;
    default: return null;
  }
}

module.exports = { convertToMilliseconds };
