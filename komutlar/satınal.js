const fs = require('fs');
const { MessageEmbed } = require('discord.js');

// Hedef kanal ID'si
const hedefKanalId = '1235417259774574652';

module.exports = {
    name: 'satınal',
    description: 'Belirli bir ürünü satın alır',
    execute(message, args) {
        // Argümanların doğruluğunu kontrol et
        if (args.length !== 1) {
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription('Komutu doğru kullanın. Örnek: `!satınal ürünkodu`');
            return message.reply({ embeds: [embed] });
        }

        const ürünKodu = args[0].trim().toLowerCase();

        // Market JSON dosyasını oku
        let market = [];
        try {
            const data = fs.readFileSync('market.json', 'utf8');
            market = JSON.parse(data);
        } catch (err) {
            console.error('Market dosyası okunurken bir hata oluştu:', err);
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription('Market dosyası okunurken bir hata oluştu.');
            return message.reply({ embeds: [embed] });
        }

        // Ürünü marketten bul
        const product = market.find(p => p.kod.toLowerCase() === ürünKodu);
        if (!product) {
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription(`Belirtilen ürün kodu ile eşleşen bir ürün bulunamadı.`);
            return message.reply({ embeds: [embed] });
        }

        // Kullanıcının bakiyesini kontrol et
        const user = message.author;
        let bakiye = {};
        try {
            const data = fs.readFileSync('cüzdan.json', 'utf8');
            bakiye = JSON.parse(data);
        } catch (err) {
            console.error('Cüzdan dosyası okunurken bir hata oluştu:', err);
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription('Cüzdan dosyası okunurken bir hata oluştu.');
            return message.reply({ embeds: [embed] });
        }

        const userBakiye = bakiye[user.id] || { cash: 0, token: 0 };
        const fiyat = product.fiyat;
        const tür = product.tür;

        if (tür === 'cash' && userBakiye.cash < fiyat) {
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription('Yeterli nakit paranız yok.');
            return message.reply({ embeds: [embed] });
        } else if (tür === 'token' && userBakiye.token < fiyat) {
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription('Yeterli tokeniniz yok.');
            return message.reply({ embeds: [embed] });
        }

        // Ürünü satın al
        if (tür === 'cash') {
            bakiye[user.id].cash -= fiyat;
        } else {
            bakiye[user.id].token -= fiyat;
        }

        // Satın alınan ürünleri satınalımlar JSON dosyasına kaydet
        let satınalımlar = [];
        try {
            const data = fs.readFileSync('satınalımlar.json', 'utf8');
            satınalımlar = JSON.parse(data);
        } catch (err) {
            console.error('Satınalımlar dosyası okunurken bir hata oluştu:', err);
        }

        const yeniSatınalım = {
            kullanıcı: user.username,
            ürünAdı: product.ad,
            fiyat: fiyat,
            tür: tür,
            kod: ürünKodu
        };

        satınalımlar.push(yeniSatınalım);

        try {
            fs.writeFileSync('satınalımlar.json', JSON.stringify(satınalımlar, null, 2));
        } catch (err) {
            console.error('Satınalımlar dosyasına yazılırken bir hata oluştu:', err);
        }

        // Cüzdan JSON dosyasına yaz
        try {
            fs.writeFileSync('cüzdan.json', JSON.stringify(bakiye, null, 2));
        } catch (err) {
            console.error('Cüzdan dosyasına yazılırken bir hata oluştu:', err);
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription('Cüzdan dosyasına yazılırken bir hata oluştu.');
            return message.reply({ embeds: [embed] });
        }

        // Satın alınan ürünü kullanıcıya DM olarak gönder
        const embedDM = new MessageEmbed()
            .setColor('#00ff00')
            .setTitle('Satın Alınan Ürün')
            .addFields(
                { name: 'Ürün Adı', value: product.ad.toString(), inline: true },
                { name: 'Fiyat', value: fiyat.toString(), inline: true },
                { name: 'Tür', value: tür.toString(), inline: true },
                { name: 'Ürün Kodu', value: ürünKodu.toString(), inline: true }
            )
            .setImage('https://cdn.discordapp.com/attachments/1235377927038697472/1235641771283714170/IMG_4320.png?ex=6637bf93&is=66366e13&hm=be256ed7ebce341f87c1fb7353292198c6a9bd2fa4684620122972d7dbf3322c&')
            .setTimestamp();
        user.send({ embeds: [embedDM] });

        // Sohbete satın alınan ürünü gönder
        const embed = new MessageEmbed()
            .setColor('#00ff00')
            .setTitle('Satın Alınan Ürün')
            .addFields(
                { name: 'Kullanıcı', value: `<@${message.author.id}>`, inline: true },
                { name: 'Ürün Adı', value: product.ad.toString(), inline: true },
            )
            .setImage('https://cdn.discordapp.com/attachments/1235377927038697472/1235641771283714170/IMG_4320.png?ex=6637bf93&is=66366e13&hm=be256ed7ebce341f87c1fb7353292198c6a9bd2fa4684620122972d7dbf3322c&')
            .setTimestamp();
        message.channel.send({ embeds: [embed] });

        // Hedef kanala satın alınan ürünü gönder
        const hedefKanal = message.guild.channels.cache.get(hedefKanalId);
        if (hedefKanal) {
            const embedHedef = new MessageEmbed()
                .setColor('#00ff00')
                .setTitle('Bir Ürün Satıldı')
                .setDescription(`Satın alan kullanıcı:${message.author}`)
                .addFields(
                    { name: 'Ürün Adı', value: product.ad.toString(), inline: true },
                    { name: 'Fiyat', value: fiyat.toString(), inline: true },
                    { name: 'Tür', value: tür.toString(), inline: true },
                    { name: 'Ürün Kodu', value: ürünKodu.toString(), inline: true }
                )
                .setImage('https://cdn.discordapp.com/attachments/1235377927038697472/1235641771283714170/IMG_4320.png?ex=6637bf93&is=66366e13&hm=be256ed7ebce341f87c1fb7353292198c6a9bd2fa4684620122972d7dbf3322c&')
                .setTimestamp();
            hedefKanal.send({ embeds: [embedHedef] });
        } else {
            console.error('Hedef kanal bulunamadı.');
        }
    }
};
