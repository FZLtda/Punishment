const GiveawayManager = require('../utils/GiveawayManager');

module.exports = {
    name: 'test',
    description: 'Gerencia sorteios no servidor.',
    execute(message, args) {
        const giveawayManager = new GiveawayManager(message.client);
        giveawayManager.startGiveaway(message, args);
    }
};
