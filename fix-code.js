const fs = require('fs');
const path = require('path');
const { ESLint } = require('eslint');
const logger = require('./src/utils/logger.js');

const FIX_TARGET_DIR = path.join(__dirname, 'src');

async function fixCode(directory) {
  const eslint = new ESLint({ fix: true });

  async function processFile(filePath) {
    try {
      const results = await eslint.lintFiles([filePath]);
      await ESLint.outputFixes(results);

      const formatter = await eslint.loadFormatter('stylish');
      const resultText = formatter.format(results);

      logger.info(`✔ Arquivo corrigido: ${filePath}`);
      if (resultText.trim()) {
        logger.debug(resultText);
      }
    } catch (error) {
      logger.error(`Erro ao processar ${filePath}: ${error.message}`);
    }
  }

  function walk(dir) {
    fs.readdirSync(dir).forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (fullPath.endsWith('.js') || fullPath.endsWith('.ts')) {
        processFile(fullPath);
      }
    });
  }

  try {
    walk(directory);
    logger.info('Correção automática finalizada.');
  } catch (err) {
    logger.error(`Erro ao percorrer diretório: ${err.message}`);
  }
}

fixCode(FIX_TARGET_DIR);