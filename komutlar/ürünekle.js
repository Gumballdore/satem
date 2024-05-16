const fs = require('fs');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'ürünekle',
    description: 'Markete yeni bir ürün ekler',
    execute(message, args) {
        // Yetkili rollerin ID'lerini buraya yazın
        const authorizedRoles = ['1235417562171441192', '1235417562171441192', '1235417562171441192'];

        // Yetkili rol kontrolü
        if (!message.member.roles.cache.some(role => authorizedRoles.includes(role.id))) {
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription('Bu komutu kullanmaya yetkiniz yok.');
            return message.reply({ embeds: [embed] });
        }

        // Komutun doğru kullanımını kontrol et
        if (args.length < 3) {
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription('Komutu doğru kullanın. Örnek: `!ürünekle Ürün adı, Fiyatı (100), Türü(Cash veya Token)`');
            return message.reply({ embeds: [embed] });
        }

        // Ürün adını, fiyatı ve türünü al
        const [ürünAdı, fiyatArg, tür] = args.join(' ').split(',');
        const fiyat = parseInt(fiyatArg);

        // Fiyatın geçerli olup olmadığını kontrol et
        if (isNaN(fiyat) || fiyat <= 0) {
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription('Geçersiz fiyat. Fiyatı doğru bir şekilde belirtin. (Örneğin: 100)');
            return message.reply({ embeds: [embed] });
        }

        // Türün "Cash" veya "Token" olduğunu kontrol et
        if (!['cash', 'token'].includes(tür.trim().toLowerCase())) {
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription('Geçersiz tür. Türü doğru bir şekilde belirtin. (Örneğin: Cash veya Token)');
            return message.reply({ embeds: [embed] });
        }

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

        // Aynı ürünün daha önce eklenip eklenmediğini kontrol et
        const existingProduct = market.find(product => product.ad.toLowerCase() === ürünAdı.trim().toLowerCase());
        if (existingProduct) {
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription(`"${ürünAdı.trim()}" adlı ürün zaten mevcut.`);
            return message.reply({ embeds: [embed] });
        }

        // Rastgele bir ürün kodu oluştur
        const ürünKodu = Math.random().toString(36).substring(2, 8);

        // Yeni ürünü markete ekle
        market.push({
            kod: ürünKodu,
            ad: ürünAdı.trim(),
            fiyat: fiyat,
            tür: tür.trim().toLowerCase()
        });

        // Market JSON dosyasına yaz
        try {
            fs.writeFileSync('market.json', JSON.stringify(market, null, 2));
            const embed = new MessageEmbed()
                .setColor('#00ff00')
                .setDescription(`"${ürünAdı.trim()}" ürünü başarıyla eklendi! Ürün kodu: ${ürünKodu}`);
            message.reply({ embeds: [embed] });
        } catch (err) {
            console.error('Market dosyasına yazılırken bir hata oluştu:', err);
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription('Market dosyasına yazılırken bir hata oluştu.');
            return message.reply({ embeds: [embed] });
        }
    }
};
