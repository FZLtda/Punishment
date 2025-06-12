const fs = require('fs');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'create-eslint-config',
  description: 'Cria o arquivo eslint.config.js com configurações básicas.',
  ownerOnly: true,
  async execute(message) {
    const content = `export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
    },
  },
];`;

    try {
      fs.writeFileSync('eslint.config.js', content);
      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('📝 Arquivo criado')
        .setDescription('O arquivo `eslint.config.js` foi criado com sucesso.');
      return message.reply({ embeds: [embed] });
    } catch (e) {
      return message.reply(`❌ Erro ao criar arquivo:\n\`\`\`${e.message}\`\`\``);
    }
  },
};
