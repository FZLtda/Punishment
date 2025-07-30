'use strict';

module.exports = [
  {
    id: 'adm',
    name: 'Administração',
    description: 'Comandos administrativos e de configuração do servidor.',
    commands: [
      { name: 'addemoji', description: 'Adiciona um emoji ao servidor.', id: '000000000000000011' },
      { name: 'backup', description: 'Cria um backup do servidor.', id: '000000000000000012' },
      { name: 'copyemoji', description: 'Copia um emoji de outro servidor.', id: '000000000000000013' },
      { name: 'prefix', description: 'Altera o prefixo do bot.', id: '000000000000000005' },
      { name: 'regras', description: 'Exibe ou define as regras do servidor.', id: '000000000000000014' },
      { name: 'restore', description: 'Restaura o backup do servidor.', id: '000000000000000015' },
      { name: 'setlog', description: 'Define o canal de logs.', id: '000000000000000016' },
    ],
  },
  {
    id: 'mod',
    name: 'Moderação',
    description: 'Ferramentas para moderação de usuários e canais.',
    commands: [
      { name: 'ban', description: 'Bane um usuário do servidor.', id: '000000000000000001' },
      { name: 'kick', description: 'Expulsa um usuário do servidor.', id: '000000000000000002' },
      { name: 'clear', description: 'Limpa mensagens de um canal.', id: '000000000000000017' },
      { name: 'lock', description: 'Trava um canal para todos.', id: '000000000000000018' },
      { name: 'lockuser', description: 'Impede um usuário de enviar mensagens.', id: '000000000000000019' },
      { name: 'mute', description: 'Silencia um usuário.', id: '000000000000000020' },
      { name: 'send', description: 'Envia uma mensagem como o bot.', id: '000000000000000021' },
      { name: 'slowmode', description: 'Define o modo lento em um canal.', id: '000000000000000022' },
      { name: 'unban', description: 'Desbane um usuário.', id: '000000000000000023' },
      { name: 'unlock', description: 'Destrava um canal.', id: '000000000000000024' },
      { name: 'unlockuser', description: 'Libera um usuário silenciado.', id: '000000000000000025' },
      { name: 'unmute', description: 'Remove o silêncio de um usuário.', id: '000000000000000026' },
    ],
  },
  {
    id: 'info',
    name: 'Informações',
    description: 'Comandos para exibir informações.',
    commands: [
      { name: 'avatar', description: 'Exibe o avatar de um usuário.', id: '000000000000000027' },
      { name: 'botinfo', description: 'Informações sobre o bot.', id: '000000000000000028' },
      { name: 'help', description: 'Mostra a lista de comandos.', id: '000000000000000029' },
      { name: 'ping', description: 'Exibe a latência do bot.', id: '000000000000000030' },
      { name: 'stats', description: 'Estatísticas do bot.', id: '000000000000000031' },
      { name: 'userinfo', description: 'Exibe informações de um usuário.', id: '000000000000000003' },
    ],
  },
  {
    id: 'util',
    name: 'Utilitários',
    description: 'Utilitários gerais para o servidor.',
    commands: [
      { name: 'privacy', description: 'Mostra a política de privacidade.', id: '000000000000000032' },
      { name: 't', description: 'Traduz um texto.', id: '000000000000000033' },
    ],
  },
  {
    id: 'giveaway',
    name: 'Giveaway',
    description: 'Gerenciamento de sorteios no servidor.',
    commands: [
      { name: 'cancelar', description: 'Cancela um sorteio em andamento.', id: '000000000000000034' },
      { name: 'sorteio', description: 'Inicia um novo sorteio.', id: '000000000000000035' },
      { name: 'rerolar', description: 'Escolhe um novo vencedor.', id: '000000000000000036' },
    ],
  },
];
