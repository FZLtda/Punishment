module.exports = function validateEnv() {
    if (!process.env.sTOKEN) {
      console.error('[ERROR] Token do bot não encontrado no arquivo .env');
      process.exit(1);
    }
  
    console.log('[INFO] Variáveis de ambiente validadas com sucesso.');
  };