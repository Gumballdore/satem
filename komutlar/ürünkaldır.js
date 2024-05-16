const fs = require('fs');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'ürünkaldır',
    description: 'Marketteki bir ürünü kaldırır',
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
        if (args.length !== 1) {
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription('Komutu doğru kullanın. Örnek: `!ürünkaldır ürünkodu`');
            return message.reply({ embeds: [embed] });
        }

        // Ürün kodunu al
        const ürünKodu = args[0];

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

        // Ürünü bul ve kaldır
        const removedProductIndex = market.findIndex(product => product.kod === ürünKodu);
        if (removedProductIndex === -1) {
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription(`"${ürünKodu}" kodlu ürün bulunamadı.`);
            return message.reply({ embeds: [embed] });
        }

        // Ürünü kaldır
        market.splice(removedProductIndex, 1);

        // Market JSON dosyasına yaz
        try {
            fs.writeFileSync('market.json', JSON.stringify(market, null, 2));
            const embed = new MessageEmbed()
                .setColor('#00ff00')
                .setDescription(`"${ürünKodu}" kodlu ürün başarıyla kaldırıldı.`);
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
