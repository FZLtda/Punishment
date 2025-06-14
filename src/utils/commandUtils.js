const categories = {
  moderation: { label: 'Moderação', emoji: '🛡️' },
  info: { label: 'Informações', emoji: '📖' },
  fun: { label: 'Diversão', emoji: '🎉' },
  utility: { label: 'Utilidades', emoji: '🧰' }
};

function getCommandsByCategory(commands, category) {
  return commands
    .filter(cmd => cmd.category === category)
    .sort((a, b) => a.name.localeCompare(b.name));
}

module.exports = { categories, getCommandsByCategory };
