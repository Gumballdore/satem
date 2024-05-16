const fs = require('fs');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'görevkaldır',
    description: 'görevlerteki bir görevü kaldırır',
    execute(message, args) {
        // Yetkili rollerin ID'lerini buraya yazın
        const authorizedRoles = ['965752269318533184', '1235417562171441192', '1235417562171441192'];

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
                .setDescription('Komutu doğru kullanın. Örnek: `!görevkaldır görevkodu`');
            return message.reply({ embeds: [embed] });
        }

        // Görev kodunu al
        const görevKodu = args[0];

        // Görevler JSON dosyasını oku
        let görevler = [];
        try {
            const data = fs.readFileSync('görevler.json', 'utf8');
            görevler = JSON.parse(data);
        } catch (err) {
            console.error('Görevler dosyası okunurken bir hata oluştu:', err);
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription('Görevler dosyası okunurken bir hata oluştu.');
            return message.reply({ embeds: [embed] });
        }

        // Görevi bul ve kaldır
        const removedProductIndex = görevler.findIndex(product => product.görevKodu === görevKodu);
        if (removedProductIndex === -1) {
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription(`"${görevKodu}" kodlu görev bulunamadı.`);
            return message.reply({ embeds: [embed] });
        }

        // Görevi kaldır
        görevler.splice(removedProductIndex, 1);

        // görevler JSON dosyasına yaz
        try {
            fs.writeFileSync('görevler.json', JSON.stringify(görevler, null, 2));
            const embed = new MessageEmbed()
                .setColor('#00ff00')
                .setDescription(`"${görevKodu}" kodlu görev başarıyla kaldırıldı.`);
            message.reply({ embeds: [embed] });
        } catch (err) {
            console.error('Görevler dosyasına yazılırken bir hata oluştu:', err);
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription('Görevler dosyasına yazılırken bir hata oluştu.');
            return message.reply({ embeds: [embed] });
        }
    }
};
