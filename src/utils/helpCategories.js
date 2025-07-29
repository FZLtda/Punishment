'use strict';

module.exports = [
  {
    id: 'moderation',
    name: 'Moderação',
    emoji: '🔨',
    description: 'Comandos para gerenciar o servidor e moderar membros.',
    commands: [
      { name: 'ban', description: 'Bane um usuário do servidor.', id: '000000000000000001' },
      { name: 'kick', description: 'Expulsa um usuário do servidor.', id: '000000000000000002' },
    ],
  },
  {
    id: 'utilities',
    name: 'Utilidades',
    emoji: '📎',
    description: 'Ferramentas e utilidades úteis para o servidor.',
    commands: [
      { name: 'userinfo', description: 'Exibe informações de um usuário.', id: '000000000000000003' },
      { name: 'serverinfo', description: 'Mostra informações do servidor.', id: '000000000000000004' },
    ],
  },
  {
    id: 'config',
    name: 'Configuração',
    emoji: '⚙️',
    description: 'Configurações e ajustes do bot.',
    commands: [
      { name: 'prefix', description: 'Altera o prefixo do bot.', id: '000000000000000005' },
    ],
  },
];
