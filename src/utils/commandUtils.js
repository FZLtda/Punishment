module.exports.categories = {
  info: { label: 'Informações', emoji: '📖' },
  mod: { label: 'Moderação', emoji: '🛡️' },
  fun: { label: 'Diversão', emoji: '🎉' },
  util: { label: 'Utilidades', emoji: '🛠️' },
  staff: { label: 'Staff', emoji: '🔧' }
};

module.exports.getCommandsByCategory = (commands, category) => {
  return [...commands.values()].filter(cmd => cmd.category === category);
};
