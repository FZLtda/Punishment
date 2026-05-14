"use strict";

const { sendToWebhook } = require("./webhook");

function applyOverrides(baseLogger, levels) {
  for (const [level] of Object.entries(levels)) {
    baseLogger[level] = (message, error) => {
      const isError = error instanceof Error;
      const formattedMessage = isError
        ? `${message}\n${error.stack}`
        : typeof message === "string"
          ? message
          : JSON.stringify(message, null, 2);

      baseLogger.log({ level, message: formattedMessage });

      if (["error", "fatal"].includes(level)) {
        sendToWebhook(level, formattedMessage);
      }

      if (level === "fatal") process.exit(1);
    };
  }
}

module.exports = { applyOverrides };
