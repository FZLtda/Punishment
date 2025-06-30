try {
  require('./src/index.js');
} catch (err) {
  console.error('Erro ao iniciar o bot:', err);
  process.exit(1);
}
