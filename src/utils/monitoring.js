const express = require('express');

function monitorBot() {
  const app = express();

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), memory: process.memoryUsage() });
  });

  const PORT = process.env.MONITOR_PORT || 3000;
  app.listen(PORT, () => console.log(`[INFO] Monitoramento ativo na porta ${PORT}`));
}

module.exports = { monitorBot };