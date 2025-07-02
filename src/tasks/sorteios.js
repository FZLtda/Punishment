const Giveaway = require('@models/Giveaway');
const { finalizarSorteio } = require('@utils/sorteios');

module.exports = (client) => {
  setInterval(async () => {
    const agora = new Date();
    const pendentes = await Giveaway.find({
      endsAt: { $lte: agora },
      status: 'ativo'
    });

    for (const sorteio of pendentes) {
      await finalizarSorteio(sorteio, client);
    }
  }, 60 * 1000);
};
