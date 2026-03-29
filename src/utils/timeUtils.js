"use strict";

/**
 * Converte duração em formato "1m", "2h", "3d" para milissegundos.
 * @param {string} tempo - A string de tempo original (ex: "10m").
 * @returns {number|null} - O valor em milissegundos ou null se for inválido.
 */
const convertToMilliseconds = (tempo) => {
  const match = tempo.toLowerCase().match(/^(\d+)(s|m|h|d)$/);
  if (!match) return null;

  const valor = parseInt(match[1], 10);
  const unidade = match[2];

  const multiplicadores = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return valor * multiplicadores[unidade];
};

/**
 * Converte uma string de tempo (ex: "1m", "2d") para sua representação por extenso.
 * @param {string} input - A string de tempo original.
 * @returns {string} - O tempo formatado por extenso.
 */
const formatVerboseDuration = (input) => {
  const match = input.toLowerCase().match(/^(\d+)(s|m|h|d)$/);
  if (!match) return input;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const labels = {
    s: value === 1 ? "segundo" : "segundos",
    m: value === 1 ? "minuto" : "minutos",
    h: value === 1 ? "hora" : "horas",
    d: value === 1 ? "dia" : "dias"
  };

  return `${value} ${labels[unit]}`;
};

module.exports = { 
  convertToMilliseconds, 
  formatVerboseDuration 
};
