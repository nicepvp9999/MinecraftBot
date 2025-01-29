const mineflayer = require('mineflayer');
const axios = require('axios');
const readline = require('readline');
const SocksProxyAgent = require('socks-proxy-agent');

// ScraperAPI'den proxy almak için fonksiyon
async function getProxy() {
  try {
    const response = await axios.get('http://proxy-server.scraperapi.com:8001', {
      params: {
        api_key: 'fe2927e337c2c22c55641c3dcf096b78',  // ScraperAPI API anahtarınız
        url: 'http://httpbin.org/ip'
      }
    });

    if (response.data) {
      const proxy = response.data.origin;
      console.log(`Proxy alındı: ${proxy}`);
      return proxy;
    }
  } catch (error) {
    console.error('Proxy çekme hatası: ', error.message);
    return null;
  }
}

// Konsol Arayüzü
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Sunucu IP: ', (host) => {
  rl.question('Port: ', (port) => {
    rl.question('Bot sayısı: ', (botSayısı) => {
      startBots(host, port, botSayısı);
    });
  });
});

// Botları Başlat
async function startBots(host, port, botSayısı) {
  for (let i = 0; i < botSayısı; i++) {
    const proxy = await getProxy();
    if (proxy) {
      createBot(host, port, `Bot_${i + 1}`, proxy);
    } else {
      console.log(`Proxy alınamadı, ${i + 1}. bot başlatılamaz.`);
    }
  }
}

// Bot Oluşturma
function createBot(host, port, username, proxy) {
  if (!proxy) {
    console.log('Proxy alınamadı, bot başlatılamaz.');
    return;
  }

  const agent = new SocksProxyAgent(`socks4://${proxy}`);
  const bot = mineflayer.createBot({
    host,
    port,
    username,
    version: false,
    agent,
    physEnabled: true,
  });

  bot.on('spawn', () => {
    console.log(`✅ ${username} sunucuya bağlandı.`);
    setInterval(() => randomChat(bot), 30000);
    performLogin(bot);
    setInterval(() => bot.setControlState('jump', true), 3000);  // Zıplama
    setInterval(() => bot.setControlState('forward', true), 2000);  // Hareket
    setInterval(() => bot.setControlState('right', true), 1500); // Sağ Tıklama
    setInterval(() => bot.setControlState('left', true), 1500); // Sol Tıklama
  });

  bot.on('error', (err) => handleError(err, host, port, username, proxy));
  bot.on('end', () => handleEnd(host, port, username, proxy));
  bot.on('death', () => {
    console.log(`${username} öldü, yeniden doğuyor...`);
    bot.spawn();
  });

  bot.on('chat', (username, message) => {
    if (message.includes('EconReset')) {
      console.log('EconReset hatası, yeniden başlatılıyor...');
      bot.quit();
      startBots(host, port, 1);
    }
  });
}

// Hata Yönetimi
function handleError(err, host, port, username, proxy) {
  console.log('Bot hatası:', err);
  getProxy().then((proxy) => {
    createBot(host, port, username, proxy);
  });
}

// Bot Bitiminde Yeniden Başlatma
function handleEnd(host, port, username, proxy) {
  console.log(`${username} sonlandı. Yeniden başlatılıyor...`);
  getProxy().then((proxy) => {
    createBot(host, port, username, proxy);
  });
}

// Rastgele Chat Mesajları
function randomChat(bot) {
  const messages = ['Anyaz_PKG CrackİsOn!', 'CrackOn! Beta', 'not Ddos Protections Servers!'];
  const message = messages[Math.floor(Math.random() * messages.length)];
  bot.chat(message);
}

// Login/Register İşlemi
function performLogin(bot) {
  const loginMessage = 'Crack!';
  bot.chat(`/login ${loginMessage}`);
  setTimeout(() => bot.chat(`/register ${loginMessage} ${loginMessage}`), 1000);
                }
