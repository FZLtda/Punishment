const Logger = require('@logger/index');

const REQUIRED_ENV_VARS = ['TOKEN', 'MONGO_URI'];

function validateEnvironment() {
  let allGood = true;

  for (const variable of REQUIRED_ENV_VARS) {
    if (!process.env[variable]) {
      Logger.error(`Variável de ambiente ausente: ${variable}`);
      allGood = false;
    }
  }

  if (!allGood) {
    Logger.warn('Verifique o arquivo .env e defina todas as variáveis necessárias.');
    process.exit(1);
  }

  Logger.success('Variáveis de ambiente validadas com sucesso.');
}

module.exports = {
  validateEnvironment
};
