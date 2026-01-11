'use strict';

/*
 * interactionCreate
 * - Middleware pipeline
 * - GlobalBan
 * - Terms enforcement
 * - Metrics & observability
 * - Circuit breaker
 */

const { InteractionType } = require('discord.js');

const Logger = require('@logger');
const handleInteraction = require('@interactions/handleInteraction');
const { sendInteractionError } = require('@helpers/responses');

const checkGlobalBan = require('@middlewares/checkGlobalBan');
const checkTerms = require('@middlewares/checkTerms');

const CONFIG = {
  MIDDLEWARE_TIMEOUT: 3000,
  HANDLER_TIMEOUT: 5000,
  CIRCUIT_BREAKER_THRESHOLD: 5,
  LOG_SAMPLE_RATE: 5,
};

const METRICS = {
  total: 0,
  errors: 0,
  operationalErrors: 0,
  criticalErrors: 0,
  unhandled: 0,
  termsBlocked: 0,
};

const CIRCUIT = {
  globalBanFailures: 0,
  termsFailures: 0,
};

module.exports = {
  name: 'interactionCreate',
  once: false,

  async execute(interaction, client) {
    if (shouldIgnore(interaction)) return;

    const ctx = createContext(interaction, client);

    try {
      const allowed = await runMiddlewares(ctx, [
        globalBanMiddleware,
        termsMiddleware,
      ]);

      if (!allowed) return;

      const handled = await withTimeout(
        () => handleInteraction(interaction, client),
        'handleInteraction',
        CONFIG.HANDLER_TIMEOUT
      );

      if (!handled) {
        METRICS.unhandled++;

        if (shouldSampleLog()) {
          Logger.warn(`[INTERACTION] Não tratada: ${ctx.label}`);
        }

        await sendInteractionError(
          interaction,
          'Essa interação não pôde ser processada.'
        );
      }

    } catch (error) {
      METRICS.errors++;

      if (isOperationalError(error)) {
        METRICS.operationalErrors++;
      } else {
        METRICS.criticalErrors++;
      }

      logError(ctx, error);

      await sendInteractionError(
        interaction,
        'Ocorreu um erro inesperado ao processar sua interação.'
      );
    }
  },
};

// Middlewares

async function globalBanMiddleware(ctx) {
  if (CIRCUIT.globalBanFailures >= CONFIG.CIRCUIT_BREAKER_THRESHOLD) {
    Logger.warn('[CIRCUIT] GlobalBan em modo degradado');
    return true;
  }

  try {
    const banned = await withTimeout(
      () => checkGlobalBan(ctx.interaction),
      'checkGlobalBan'
    );

    CIRCUIT.globalBanFailures = 0;
    return !banned;

  } catch (err) {
    CIRCUIT.globalBanFailures++;
    throw err;
  }
}

async function termsMiddleware(ctx) {
  if (isTermsInteraction(ctx.interaction)) return true;

  if (CIRCUIT.termsFailures >= CONFIG.CIRCUIT_BREAKER_THRESHOLD) {
    Logger.warn('[CIRCUIT] Terms em modo degradado');
    return true;
  }

  try {
    const accepted = await withTimeout(
      () => checkTerms({
        user: ctx.user,
        client: ctx.client,
        reply: ctx.safeReply,
      }),
      'checkTerms'
    );

    CIRCUIT.termsFailures = 0;

    if (!accepted) {
      METRICS.termsBlocked++;
      Logger.info(`[TERMS] ${ctx.user.tag} (${ctx.label})`);
    }

    return accepted;

  } catch (err) {
    CIRCUIT.termsFailures++;
    throw err;
  }
}

// Infra

async function runMiddlewares(ctx, middlewares) {
  for (const middleware of middlewares) {
    if (!(await middleware(ctx))) return false;
  }
  return true;
}

function createContext(interaction, client) {
  METRICS.total++;

  return Object.freeze({
    interaction,
    client,
    user: interaction.user,
    guild: interaction.guild,
    label: getLabel(interaction),
    safeReply: createSafeReply(interaction),
  });
}

function createSafeReply(interaction) {
  return async options => {
    const payload = { ...options, flags: 1 << 6 };

    if (interaction.replied || interaction.deferred) {
      return interaction.followUp(payload);
    }

    return interaction.reply(payload);
  };
}

function shouldIgnore(interaction) {
  return !interaction.guild || interaction.user?.bot;
}

function isTermsInteraction(interaction) {
  return interaction.isButton() && interaction.customId === 'terms_accept';
}

function isOperationalError(error) {
  return error?.name === 'TimeoutError';
}

function shouldSampleLog() {
  return METRICS.unhandled % CONFIG.LOG_SAMPLE_RATE === 0;
}

function logError(ctx, error) {
  const level = isOperationalError(error) ? 'warn' : 'error';

  Logger[level](
    `[INTERACTION] ${ctx.label}\n${error.stack || error.message}`
  );
}

async function withTimeout(fn, label, timeout = CONFIG.MIDDLEWARE_TIMEOUT) {
  return Promise.race([
    fn(),
    new Promise((_, reject) =>
      setTimeout(() => {
        const err = new Error(`Timeout: ${label}`);
        err.name = 'TimeoutError';
        reject(err);
      }, timeout)
    ),
  ]);
}

// Metrics log

setInterval(() => {
  Logger.debug(
    `[INTERACTION_METRICS] total=${METRICS.total} ` +
    `errors=${METRICS.errors} ` +
    `operational=${METRICS.operationalErrors} ` +
    `critical=${METRICS.criticalErrors} ` +
    `unhandled=${METRICS.unhandled} ` +
    `terms=${METRICS.termsBlocked}`
  );
}, 60_000).unref();

// Utils

function getLabel(interaction) {
  if (interaction.isChatInputCommand())
    return `SLASH /${interaction.commandName}`;

  if (interaction.isButton())
    return `BUTTON ${interaction.customId}`;

  if (interaction.isStringSelectMenu?.())
    return `SELECT_MENU/STRING ${interaction.customId}`;

  if (interaction.isUserSelectMenu?.())
    return `SELECT_MENU/USER ${interaction.customId}`;

  if (interaction.isRoleSelectMenu?.())
    return `SELECT_MENU/ROLE ${interaction.customId}`;

  if (interaction.type === InteractionType.ModalSubmit)
    return `MODAL ${interaction.customId}`;

  if (interaction.type === InteractionType.ApplicationCommandAutocomplete)
    return `AUTOCOMPLETE /${interaction.commandName}`;

  return `UNKNOWN (${interaction.type})`;
}
