const { getPrefix, setPrefix } = require('../utils/prefixes');
const db = require('../data/database');

async function handleCommands(message, client) {
  const prefix = getPrefix(message.guild.id);
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  if (!command) return;

  if (!userAcceptedTerms(message.author.id)) {
    return sendTermsMessage(message);
  }

  try {
    await command.execute(message, args, { setPrefix, getPrefix });
    setTimeout(() => message.delete().catch(() => {}), 10);
  } catch (error) {
    console.error(`[ERROR] Erro ao executar o comando "${commandName}":`, error);
    const embedErro = {
      color: 0xfe3838,
      author: { name: 'Erro ao executar o comando.', icon_url: 'http://bit.ly/4aIyY9j' },
    };
    await message.reply({ embeds: [embedErro], allowedMentions: { repliedUser: false } });
  }
}

function userAcceptedTerms(userId) {
  return db.prepare('SELECT user_id FROM accepted_users WHERE user_id = ?').get(userId);
}

async function sendTermsMessage(message) {
  const embed = {
    color: 0xfe3838,
    title: 'Termos de Uso',
    description: 'Aceite os Termos para usar o Punishment.',
    footer: { text: 'Obrigado por utilizar o Punishment!' },
  };
  
  const row = { type: 1, components: [
    { type: 2, label: 'Ler Termos', style: 5, url: 'https://docs.google.com/document/d/12-nG-vY0bhgIzsaO2moSHjh7QeCrQLSGd7W2XYDMXsk/mobilebasic' },
    { type: 2, custom_id: 'accept_terms', label: 'Aceitar Termos', style: 3 },
  ]};
  
  await message.reply({ embeds: [embed], components: [row], allowedMentions: { repliedUser: false } });
}

module.exports = { handleCommands };
