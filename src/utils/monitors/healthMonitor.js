const mongoose = require("mongoose");

async function getSystemHealth(client) {
  const mongoStatus = {
    state: mongoose.connection.readyState,
    status:
      mongoose.connection.readyState === 1
        ? "Conectado"
        : "Desconectado"
  };

  const discordLatency = client.ws.ping;

  const commandStats = {
    prefixCount: client.commands?.size || 0,
    slashCount: client.slashCommands?.size || 0
  };

  return {
    mongoStatus,
    discordLatency,
    commandStats
  };
}

module.exports = { getSystemHealth };
