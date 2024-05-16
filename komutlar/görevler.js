const fs = require('fs');
const { MessageEmbed } = require('discord.js');

// Yetkili rollerin ID'leri
const yetkiliRoller = ['965752269318533184', '1235417562171441192', 'rolID3'];

module.exports = {
    name: 'görevler',
    description: 'Eklenen tüm görevleri gösterir',
    execute(message) {
        // Yetkililerin komutu kullanıp kullanamayacağını kontrol et
        if (!message.member.roles.cache.some(role => yetkiliRoller.includes(role.id))) {
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription('Bu komutu kullanma yetkiniz bulunmamaktadır.');
            return message.reply({ embeds: [embed] });
        }

        // Görevler dosyasını oku
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

        // Görevleri göster
        if (görevler.length === 0) {
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription('Henüz hiç görev eklenmemiş.');
            return message.reply({ embeds: [embed] });
        }

        const embed = new MessageEmbed()
            .setColor('#00ff00')
            .setTitle('Eklenen Tüm Görevler')
            .setDescription(
                görevler.map((görev, index) => {
                    return `**Görev ${index + 1}**\n**Görev Kodu:** ${görev.görevKodu}\n**Görev Adı:** ${görev.görevAdı}\n**Açıklama:** ${görev.açıklama}\n**Ödül:** ${görev.ödül}\n**Şans Faktörü:** ${görev.şansFaktörü}`;
                }).join('\n\n')
            );
        message.reply({ embeds: [embed] });
    }
};
