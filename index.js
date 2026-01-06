const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const fs = require('fs');

const aniversarios = require('./aniversarios.json');

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './session'
  }),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', qr => {
  console.log('🔑 Escaneie o QR Code abaixo:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('🤖 Bot conectado com sucesso!');
});

client.getChats().then(chats => {
  chats
    .filter(chat => chat.isGroup)
    .forEach(group => {
      console.log('📌 Grupo:', group.name);
      console.log('🆔 ID:', group.id._serialized);
      console.log('-----------------------');
    });
});


// ⏰ Todo dia às 09:00
cron.schedule('0 9 * * *', async () => {
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, '0');
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const hojeFormatado = `${dia}-${mes}`;

  const grupoId = process.env.GRUPO_ID;

  if (!grupoId) {
    console.log('⚠️ GRUPO_ID não configurado');
    return;
  }

  aniversarios.forEach(async pessoa => {
    if (pessoa.data === hojeFormatado) {
      const mention = `${pessoa.telefone}@c.us`;
      const mensagem = `🎉 Parabéns @${pessoa.telefone.slice(2)}! Que seu dia seja incrível! 🥳🎂`;

      await client.sendMessage(grupoId, mensagem, {
        mentions: [mention]
      });

      console.log(`✅ Parabéns enviado para ${pessoa.nome}`);
    }
  });
});

client.initialize();
