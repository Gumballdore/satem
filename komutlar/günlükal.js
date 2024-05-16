const fs = require('fs');
const { MessageEmbed } = require('discord.js');

// Kullanılan komutların cooldown sürelerini tutacak Map
const cooldowns = new Map();

module.exports = {
    name: 'günlükal',
    description: 'Kullanıcılara günlük token veya cash dağıtır',
    execute(message, args) {
        // Cooldown süresi (ms)
        const cooldownSüresi = 24 * 60 * 60 * 1000; // 24 saat
        
        // Kullanıcının son kullanma zamanını al
        const lastUsed = cooldowns.get(message.author.id);

        // Eğer kullanıcı daha önce bu komutu kullanmışsa ve cooldown süresi içinde ise, uyarı ver
        if (lastUsed && Date.now() - lastUsed < cooldownSüresi) {
            const kalansüre = (cooldownSüresi - (Date.now() - lastUsed)) / 1000;
            return message.reply(`Bu komutu tekrar kullanabilmek için ${Math.floor(kalansüre / 3600)} saat ${Math.floor((kalansüre % 3600) / 60)} dakika beklemelisin.`);
        }

        // Komutun kullanılma zamanını güncelle
        cooldowns.set(message.author.id, Date.now());

        // Geri kalan kodları buraya ekleyin...
        // Günlük dağıtılacak cash miktarları
        const cashMiktarları = [100, 300, 400, 600]; // Örneğin, farklı cash miktarları

       
        const tokenMiktarları = [30, 40, 50, 60]; // Örneğin, farklı token miktarları

        // Token çıkma şansı
        const tokenÇıkmaŞansı = 0.3; // %30 şans

        // Özel rol ID'leri ve ödüllerin miktarlarını belirle
        const özelRolÖdülleri = {
            '965752269318533184': {
                cash: [2000, 2500, 3000], // Özel rol için farklı cash miktarları
                token: [500, 600, 700]    // Özel rol için farklı token miktarları
            },
            '987654321098765432': {
                cash: [1500, 1800, 2100],
                token: [400, 450, 500]
            }
            // Ek özel roller buraya eklenebilir
        };

        // Kullanıcının rollerini kontrol et
        const kullanıcıRolleri = message.member.roles.cache;
        let özelÖdülMiktarları = { cash: [], token: [] };
        kullanıcıRolleri.forEach(rol => {
            if (özelRolÖdülleri[rol.id]) {
                özelÖdülMiktarları.cash.push(...özelRolÖdülleri[rol.id].cash);
                özelÖdülMiktarları.token.push(...özelRolÖdülleri[rol.id].token);
            }
        });

        // Rastgele cash miktarını seç
        let rastgeleCashMiktarı = cashMiktarları[Math.floor(Math.random() * cashMiktarları.length)];

        // Token çıkıp çıkmayacağını belirle
        const tokenÇıktı = Math.random() < tokenÇıkmaŞansı;

        // Rastgele token miktarını seç
        let rastgeleTokenMiktarı = 0;
        if (tokenÇıktı) {
            rastgeleTokenMiktarı = tokenMiktarları[Math.floor(Math.random() * tokenMiktarları.length)];
        }

        // Eğer özel rol ödül miktarları tanımlı ise ve kullanıcı özel role sahipse, özel ödül miktarlarından birini seç
        if (özelÖdülMiktarları.cash.length > 0) {
            rastgeleCashMiktarı = özelÖdülMiktarları.cash[Math.floor(Math.random() * özelÖdülMiktarları.cash.length)];
        }
        if (özelÖdülMiktarları.token.length > 0) {
            rastgeleTokenMiktarı = özelÖdülMiktarları.token[Math.floor(Math.random() * özelÖdülMiktarları.token.length)];
        }

        // Kullanıcıların bakiyelerini tutan dosyayı oku
        let cüzdan = {};
        try {
            const data = fs.readFileSync('cüzdan.json', 'utf8');
            cüzdan = JSON.parse(data);
        } catch (err) {
            console.error('Cüzdan dosyası okunurken bir hata oluştu:', err);
            return message.reply('Cüzdan dosyası okunurken bir hata oluştu.');
        }

        // Kullanıcının cüzdanına cash veya token ekleyin
        if (!cüzdan[message.author.id]) {
            cüzdan[message.author.id] = { cash: 0, token: 0 };
        }
        if (tokenÇıktı) {
            cüzdan[message.author.id].token += rastgeleTokenMiktarı;
        } else {
            cüzdan[message.author.id].cash += rastgeleCashMiktarı;
        }

        // Cüzdan dosyasını güncelle
        fs.writeFileSync('cüzdan.json', JSON.stringify(cüzdan, null, 4));

        // Kullanıcıya mesaj gönder
        const embed = new MessageEmbed()
            .setColor('#00ff00')
            .setTitle('Günlük Ödül')
            .setDescription(`Tebrikler! ${message.author} Günlük ödül olarak ${tokenÇıktı ? `${rastgeleTokenMiktarı} token` : `${rastgeleCashMiktarı} cash`} hesabınıza eklendi!`)
            .setImage('https://cdn.discordapp.com/attachments/1235377927038697472/1235641771283714170/IMG_4320.png?ex=6637bf93&is=66366e13&hm=be256ed7ebce341f87c1fb7353292198c6a9bd2fa4684620122972d7dbf3322c&')
            .setTimestamp()
        
        message.reply({ embeds: [embed] });
    }
};
