'use strict';

const { InteractionType } = require('discord.js');

const Logger = require('@logger');
const handleInteraction = require('@interactions/handleInteraction');
const { sendInteractionError } = require('@helpers/responses');

const checkGlobalBan = require('@middlewares/checkGlobalBan');
const checkTerms = require('@middlewares/checkTerms');

const CONFIG = {
  MIDDLEWARE_TIMEOUT: 3000,
};

const METRICS = {
  total: 0,
  errors: 0,
  unhandled: 0,
  termsBlocked: 0,
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

      const handled = await handleInteraction(interaction, client);

      if (!handled) {
        METRICS.unhandled++;
        Logger.warn(`[INTERACTION] Não tratada: ${ctx.label}`);
        await sendInteractionError(interaction, 'Essa interação não pôde ser processada.');
      }

    } catch (error) {
      METRICS.errors++;
      logError(ctx, error);

      await sendInteractionError(
        interaction,
        'Ocorreu um erro inesperado ao processar sua interação.'
      );
    }
  },
};

async function globalBanMiddleware(ctx) {
  return !(await withTimeout(
    () => checkGlobalBan(ctx.interaction),
    'checkGlobalBan'
  ));
}

async function termsMiddleware(ctx) {
  const accepted = await withTimeout(
    () => checkTerms({
      user: ctx.user,
      client: ctx.client,
      reply: ctx.safeReply,
    }),
    'checkTerms'
  );

  if (!accepted) {
    METRICS.termsBlocked++;
    Logger.info(`[TERMS] ${ctx.user.tag} (${ctx.label})`);
  }

  return accepted;
}

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
    const payload = { ...options, ephemeral: true };

    if (interaction.replied || interaction.deferred) {
      return interaction.followUp(payload);
    }

    return interaction.reply(payload);
  };
}

function shouldIgnore(interaction) {
  return !interaction.guild || interaction.user?.bot;
}

function logError(ctx, error) {
  const level = error?.name === 'TimeoutError' ? 'warn' : 'error';

  Logger[level](
    `[INTERACTION] ${ctx.label}\n${error.stack || error.message}`
  );
}

async function withTimeout(fn, label) {
  return Promise.race([
    fn(),
    new Promise((_, reject) =>
      setTimeout(() => {
        const err = new Error(`Timeout: ${label}`);
        err.name = 'TimeoutError';
        reject(err);
      }, CONFIG.MIDDLEWARE_TIMEOUT)
    ),
  ]);
}

setInterval(() => {
  Logger.debug(
    `[INTERACTION_METRICS] total=${METRICS.total} ` +
    `errors=${METRICS.errors} ` +
    `unhandled=${METRICS.unhandled} ` +
    `terms=${METRICS.termsBlocked}`
  );
}, 60_000).unref();

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
