const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const cooldowns = new Map();

// Görevi kaydetme fonksiyonu
function kaydetGörev(userID, görevDetayları) {
    let kullanıcıgörevler = {};
    try {
        const data = fs.readFileSync('kullanıcıgörevler.json', 'utf8');
        kullanıcıgörevler = JSON.parse(data);
    } catch (err) {
        console.error('Kullanıcıgörevler dosyası okunurken bir hata oluştu:', err);
    }

    if (!kullanıcıgörevler[userID]) {
        kullanıcıgörevler[userID] = [];
    }

    kullanıcıgörevler[userID].push({
        görev: görevDetayları,
        tarih: new Date().toISOString()
    });

    fs.writeFileSync('kullanıcıgörevler.json', JSON.stringify(kullanıcıgörevler, null, 2));
}

function saniyedenSaatVeDakikaya(saniye) {
    const saatler = Math.floor(saniye / 3600);
    const dakikalar = Math.floor((saniye % 3600) / 60);
    return `${saatler} saat ${dakikalar} dakika`;
}


module.exports = {
    name: 'göreval',
    description: 'Rastgele bir görev gösterir',
    async execute(message, args) {
        // 24 saatte bir kullanılmasını sağlama
        const lastUsedKey = `${message.author.id}_lastUsed`;
        const lastUsed = cooldowns.get(lastUsedKey) || 0;
        const now = Date.now();
        const cooldownAmount = 24 * 60 * 60 * 1000; // 24 saat
        if (now - lastUsed < cooldownAmount) {
            const timeLeft = saniyedenSaatVeDakikaya((cooldownAmount - (now - lastUsed)) / 1000);
            return message.reply(`Bu komutu tekrar kullanabilmek için ${timeLeft} beklemelisin.`);            
        }
        cooldowns.set(lastUsedKey, now);

        // Görevleri JSON dosyasından oku
        let görevler = [];
        try {
            const data = fs.readFileSync('görevler.json', 'utf8');
            görevler = JSON.parse(data);
        } catch (err) {
            console.error('Görevler dosyası okunurken bir hata oluştu:', err);
            return message.reply('Görevler dosyası okunurken bir hata oluştu.');
        }

        // Görevlerin sayısı kontrolü
        if (görevler.length === 0) {
            return message.reply('Hiç görev eklenmemiş.');
        }

        // Rastgele bir görev seç
        const randomIndex = Math.floor(Math.random() * görevler.length);
        const selectedGörev = görevler[randomIndex];

        // Görevi gönder
        const embed = new MessageEmbed()
            .setColor('#3498db')
            .setTitle('**GÖREV ALINDI**')
            .addField('Görev Kodu', selectedGörev.görevKodu)
            .addField('**Görev Adı**', selectedGörev.görevAdı)
            .addField('**Açıklama**', selectedGörev.açıklama)
            .addField('**Ödül**', selectedGörev.ödül)
            .setImage('https://cdn.discordapp.com/attachments/1235377927038697472/1235641771283714170/IMG_4320.png?ex=6637bf93&is=66366e13&hm=be256ed7ebce341f87c1fb7353292198c6a9bd2fa4684620122972d7dbf3322c&')
            .setTimestamp()

        message.channel.send({ embeds: [embed] });

        // Görevi kullanıcının bilgilerine kaydet
        kaydetGörev(message.author.id, selectedGörev);
    }
};