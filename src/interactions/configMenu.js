module.exports = async (interaction, client) => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== 'config-select') return;
  
    const selected = interaction.values[0];
  
    switch (selected) {
      case 'prefix':
        require('../menus/prefixMenu')(interaction, client);
        break;
    }
  };
  