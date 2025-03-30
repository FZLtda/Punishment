function validateEnv() {
    const requiredEnvVars = [
      'TOKEN',
      'CLIENT_ID',
      'GITHUB_TOKEN',
      'DEEPL_API_KEY',
      'OPENAI_API_KEY',
      'GIPHY_API_KEY',
      'STRIPE_SECRET_KEY',
      'API_URL_TRANSLATE',
      'API_URL_DOCUMENT',
      'WEBHOOK',
    ];
  
    const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
  
    if (missingVars.length > 0) {
      console.error(`ERRO: Variáveis de ambiente ausentes: ${missingVars.join(', ')}`);
      process.exit(1);
    }
  
    const validations = {
      TOKEN: (value) => value.startsWith('M'),
      CLIENT_ID: (value) => /^\d+$/.test(value),
      GITHUB_TOKEN: (value) => value.startsWith('ghp_'),
      DEEPL_API_KEY: (value) => value.includes(':fx'),
      OPENAI_API_KEY: (value) => value.startsWith('sk-'),
      GIPHY_API_KEY: (value) => value.length === 32,
      STRIPE_SECRET_KEY: (value) => value.startsWith('rk_live_'),
      API_URL_TRANSLATE: (value) => value.startsWith('https://'),
      API_URL_DOCUMENT: (value) => value.startsWith('https://'),
      WEBHOOK: (value) => value.startsWith('https://discord.com/api/webhooks/'),
    };
  
    Object.entries(validations).forEach(([key, validate]) => {
      if (!validate(process.env[key])) {
        console.error(`ERRO: Variável de ambiente ${key} é inválida.`);
        process.exit(1);
      }
    });
  
    console.log('INFO: Todas as variáveis de ambiente foram validadas com sucesso.');
  }
  
  module.exports = validateEnv;