const fs = require('fs');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'alınangörevler',
    description: 'Kullanıcının aldığı görevleri gösterir',
    execute(message) {
        // Kullanıcının ID'sini al
        const kullanıcı = message.author;

        // Kullanıcıların görevlerini oku
        let görevler = {};
        try {
            const data = fs.readFileSync('kullanıcıgörevler.json', 'utf8');
            görevler = JSON.parse(data);
        } catch (err) {
            console.error('Kullanıcılar dosyası okunurken bir hata oluştu:', err);
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription('Kullanıcılar dosyası okunurken bir hata oluştu.');
            return message.reply({ embeds: [embed] });
        }

        // Kullanıcının aldığı ve 24 saatten az olan görevleri filtrele
        let alınanGörevler = görevler[kullanıcı.id] || [];
        alınanGörevler = alınanGörevler.filter(görev => {
            const tarih = new Date(görev.tarih);
            const geçenZaman = Date.now() - tarih.getTime();
            const birGün = 24 * 60 * 60 * 1000; // 24 saat
            return geçenZaman < birGün;
        });

        // Kullanıcıya görevleri göster
        if (alınanGörevler.length === 0) {
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription('Henüz hiç görev alınmamış veya 24 saati geçmiş görev bulunmuyor.');
            return message.reply({ embeds: [embed] });
        }

        const embed = new MessageEmbed()
            .setColor('#00ff00')
            .setTitle(`Aktif Görev Listesi`)
            .setDescription(`Görevi listelenen kullanıcı: ${kullanıcı}\n\n` + 
            alınanGörevler.map(görev => {
                const tarih = new Date(görev.tarih).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                return `**Görev Kodu:** ${görev.görev.görevKodu}\n**Görev Adı:** ${görev.görev.görevAdı}\n**Açıklama:** ${görev.görev.açıklama}\n**Ödül:** ${görev.görev.ödül}\n**Tarih:** ${tarih}`;
            }).join('\n\n'))
            .setImage('https://cdn.discordapp.com/attachments/1235377927038697472/1235641771283714170/IMG_4320.png?ex=6637bf93&is=66366e13&hm=be256ed7ebce341f87c1fb7353292198c6a9bd2fa4684620122972d7dbf3322c&')
            .setTimestamp()
            .setFooter('Görevi bitirdiğiniz halde göreviniz gözüküyorsa merak etmeyin 24 saati geçen görevler otomatik olarak siliniyor.');
        message.reply({ embeds: [embed] });

        // 24 saati geçen görevleri kaldır
        görevler[kullanıcı.id] = alınanGörevler;
        try {
            fs.writeFileSync('kullanıcıgörevler.json', JSON.stringify(görevler, null, 2));
        } catch (err) {
            console.error('Kullanıcılar dosyasına yazılırken bir hata oluştu:', err);
        }
    }
};
