const fs = require('fs');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'market',
    description: 'Market ürünlerini listeler',
    execute(message) {
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

        // Eğer market boşsa uygun bir mesaj gönder
        if (market.length === 0) {
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription('Market şu anda boş.');
            return message.reply({ embeds: [embed] });
        }

        // Ürünleri listele
        const embed = new MessageEmbed()
            .setColor('#00ff00')
            .setTitle('Market Ürünleri');
        
        market.forEach(product => {
            embed.addField(`${product.ad} (${product.tür})`, `**Ürün Kodu:** ${product.kod}\n**Fiyat:** ${product.fiyat}`, true);
        });

        message.reply({ embeds: [embed] });
    }
};
