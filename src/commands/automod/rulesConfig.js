module.exports = [
  {
    id: 'words',
    name: 'Bloqueio de Palavras',
    handler: require('./toggleWords'),
  },
  {
    id: 'links',
    name: 'Bloqueio de Links',
    handler: require('./toggleLinks'),
  },
  {
    id: 'spam',
    name: 'Anti-Spam',
    handler: require('./toggleSpam'),
  },
];