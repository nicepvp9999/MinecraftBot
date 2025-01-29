const mineflayer = require('mineflayer');
const axios = require('axios');
const readline = require('readline');
const SocksProxyAgent = require('socks-proxy-agent');

// Proxy Listesini Çek
async function getProxies() {
  try {
    const response = await axios.get('https://www.proxyscrape.com/api/v2/proxies?request=displayproxies&protocol=socks4');
    return response.data.split('\n').map(line => line.trim()).filter(line => line !== '');
  } catch (error) {
    console.log('Proxy çekme hatası: ' + error.message);
    return [];
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
  const proxies = await getProxies();
  for (let i = 0; i < botSayısı; i++) {
    const proxy = proxies[i % proxies.length];
    createBot(host, port, `Bot_${i + 1}`, proxy);
  }
}

// Bot Oluşturma
function createBot(host, port, username, proxy) {
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
  getProxies().then((proxies) => {
    const newProxy = proxies[Math.floor(Math.random() * proxies.length)];
    createBot(host, port, username, newProxy);
  });
}

// Bot Bitiminde Yeniden Başlatma
function handleEnd(host, port, username, proxy) {
  console.log(`${username} sonlandı. Yeniden başlatılıyor...`);
  createBot(host, port, username, proxy);
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

// Proxy Değiştirme
async function getNewProxy() {
  const proxies = await getProxies();
  return proxies[Math.floor(Math.random() * proxies.length)];
}

// Proxy Listeyi Yönetme
async function handleProxyRotation() {
  const proxies = await getProxies();
  if (proxies.length === 0) {
    console.log('Proxy bulunamadı. Tekrar dene.');
    return;
  }
  return proxies[Math.floor(Math.random() * proxies.length)];
    }
