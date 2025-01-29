const { Client, Intents } = require('discord.js');
const readline = require('readline');
const mineflayer = require('mineflayer');
const axios = require('axios');
const SocksProxyAgent = require('socks-proxy-agent');
const { setTimeout } = require('timers');

// Konsoldan giriş almak için readline arayüzü
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Kullanıcıya seçenekler sunma
console.log("Bot Başlatma Seçeneği:");
console.log("1. Konsoldan Bot Sokma");
console.log("2. Discord Üzerinden Başlat");

rl.question('Seçim yapın (1 veya 2): ', function (seçim) {
  if (seçim === '1') {
    // Konsoldan sunucu bilgileri alma
    rl.question('Sunucu IP adresini girin: ', function (host) {
      rl.question('Sunucu portunu girin: ', function (port) {
        rl.question('Bot sayısını girin: ', function (botSayısı) {
          console.log('Minecraft Botları Başlatılıyor...');
          getProxies().then((proxies) => {
            for (let i = 1; i <= botSayısı; i++) {
              const proxy = proxies[i % proxies.length]; // Her bot için farklı bir proxy
              startMinecraftBot(host, port, `Anyaz_PKG${i}`, proxy);
            }
          }).catch(err => {
            console.log("Proxy çekme hatası:", err);
            rl.close();
          });
        });
      });
    });
  } else if (seçim === '2') {
    // Discord üzerinden başlatma
    rl.question('Discord Bot Tokenini Girin: ', function (discordToken) {
      startDiscordBot(discordToken);
      rl.close();
    });
  } else {
    console.log('Geçersiz seçim.');
    rl.close();
  }
});

// Proxyscrape'den proxy alma fonksiyonu
async function getProxies() {
  try {
    const response = await axios.get('https://www.proxyscrape.com/api/v2/proxies?request=displayproxies&protocol=socks4');
    return response.data.split('\n').map(line => line.trim()).filter(line => line !== '');
  } catch (error) {
    throw new Error('Proxy çekme hatası: ' + error.message);
  }
}

// Minecraft botu başlatma
function startMinecraftBot(host, port, username, proxy) {
  const agent = new SocksProxyAgent(`socks4://${proxy}`);  // Socks4 proxy ile bağlantı
  const bot = mineflayer.createBot({
    host: host, // Sunucu IP adresi
    port: port, // Sunucu portu
    username: username, // Minecraft botunun kullanıcı adı
    version: false, // Minecraft versiyonu
    agent: agent // Proxy ile bağlanma
  });

  bot.on('spawn', () => {
    console.log(`✅ ${username} oyuna bağlandı.`);
    setInterval(() => randomChat(bot), 30000);  // Her 30 saniyede bir rastgele mesaj
  });

  bot.on('error', (err) => {
    console.error('Minecraft Bot Hatası:', err);
  });

  bot.on('end', () => {
    console.log(`Minecraft Botu ${username} sonlandı.`);
    startMinecraftBot(host, port, username, proxy);  // Bot kapanınca yeniden başlat
  });

  bot.on('chat', (username, message) => {
    // EconReset hatasına karşı çözüm (örneğin, bot yeniden başlatılabilir)
    if (message.includes('EconReset')) {
      console.log('EconReset hatası tespit edildi, bot yeniden başlatılıyor...');
      bot.quit();
      startMinecraftBot(host, port, username, proxy); // Botu yeniden başlat
    }
  });

  // Botun hareket etmesini sağla
  setInterval(() => {
    if (bot.entity) {
      bot.setControlState('jump', true);  // Zıpla
      bot.setControlState('sprint', true);  // Koş
      bot.setControlState('forward', true);  // İleri git
      setTimeout(() => {
        bot.setControlState('jump', false);
        bot.setControlState('sprint', false);
        bot.setControlState('forward', false);
      }, 2000);  // Hareketi 2 saniye sürdür
    }
  }, 5000);
}

// Discord botu başlatma
function startDiscordBot(token) {
  const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

  client.once('ready', () => {
    console.log('Discord Botu hazır!');
    console.log(`Bot adı: ${client.user.tag}`);
  });

  client.on('messageCreate', message => {
    if (message.content.startsWith('qbaşlat')) {
      const args = message.content.split(' ');
      const [_, host, port, botSayısı] = args;
      
      if (host && port && botSayısı) {
        message.channel.send('Minecraft botları başlatılıyor...');
        getProxies().then((proxies) => {
          for (let i = 1; i <= botSayısı; i++) {
            const proxy = proxies[i % proxies.length];
            startMinecraftBot(host, port, `Anyaz_PKG${i}`, proxy);
          }
        }).catch(err => {
          message.channel.send('Proxy çekme hatası: ' + err.message);
        });
      } else {
        message.channel.send('Geçersiz parametreler. Lütfen doğru formatta giriniz: qbaşlat sunucu-ip sunucu-port bot-sayısı');
      }
    }
  });

  client.login(token);
}

// Rastgele mesajlar gönderen fonksiyon
function randomChat(bot) {
  const messages = [
    'Anyaz_PKG CrackİsOn!',
    'CrackOn! Beta',
    'not Ddos Protections Servers!'
  ];

  const message = messages[Math.floor(Math.random() * messages.length)];
  bot.chat(message);  // Rastgele mesajı chat'e gönder
}