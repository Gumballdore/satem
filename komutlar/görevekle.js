const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'görevekle',
    description: 'Yeni bir görev ekler',
    execute(message, args) {
        // Yetkilendirme - Sadece belirli rolleri olan kullanıcılar komutu kullanabilir
        const yetkiliRoller = ['965752269318533184', '1235417562171441192', '1235417562171441192']; // Yetkili rollerin ID'lerini buraya ekleyin

        if (!message.member.roles.cache.some(role => yetkiliRoller.includes(role.id))) {
            return message.reply('Bu komutu kullanma izniniz yok.');
        }

        // Yanlış kullanım uyarısı
        if (!args.length) {
            return message.reply('Komutu yanlış kullandınız. Doğru kullanım: `!görevekle "Görev Adı", "Açıklama", "Ödül", "Şans Faktörü"`');
        }

        // Kullanıcıdan alınan bilgileri virgülle ayırarak işleme al
        const [görevAdı, açıklama, ödül, şansFaktörü] = args.join(' ').split(',').map(arg => arg.trim());

        // Rastgele bir görev kodu oluşturma fonksiyonu
        const rastgeleGörevKodu = () => {
            // Görev kodu için rastgele bir sayı oluşturma
            const randomNumber = Math.floor(Math.random() * 1000000);
            return `G${randomNumber.toString().padStart(6, '0')}`; // Örnek görev kodu
        };

        // Yeni görev nesnesi oluşturma
        const yeniGörev = {
            görevKodu: rastgeleGörevKodu(),
            görevAdı: görevAdı,
            açıklama: açıklama,
            ödül: ödül,
            şansFaktörü: şansFaktörü
        };

        // Aynı görevin varlığını kontrol etme
        let görevler = JSON.parse(fs.readFileSync('görevler.json', 'utf8'));
        if (görevler.some(görev => görev.görevAdı === yeniGörev.görevAdı)) {
            return message.reply('Bu görev zaten eklenmiş.');
        }

        // Gönderilecek mesajı hazırla
        const embed = new MessageEmbed()
            .setColor('#3498db')
            .setTitle('**Yeni Görev Eklendi**')
            .setDescription('**Aşağıdaki görev başarıyla eklendi:**')
            .addField('**Görev Kodu**', yeniGörev.görevKodu)
            .addField('**Görev Adı**', yeniGörev.görevAdı)
            .addField('**Açıklama**', yeniGörev.açıklama)
            .addField('**Ödül**', yeniGörev.ödül)
            .addField('**Şans Faktörü**', yeniGörev.şansFaktörü)
            .setTimestamp()
            .setImage('https://cdn.discordapp.com/attachments/1235377927038697472/1235641771283714170/IMG_4320.png?ex=6637bf93&is=66366e13&hm=be256ed7ebce341f87c1fb7353292198c6a9bd2fa4684620122972d7dbf3322c&')
            .setFooter('Görevi eklemek için yeşil butona, silmek için kırmızı butona tıklayın.');

        // Butonlar oluştur
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('yes')
                    .setLabel('Doğru')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('no')
                    .setLabel('Yanlış')
                    .setStyle('DANGER')
            );

        // Görev eklendi mesajını gönderme ve butonları ekleme
        message.channel.send({ embeds: [embed], components: [row] })
            .then(sentMessage => {
                // Butonların işlevlerini belirleme
                const filter = i => i.user.id === message.author.id;
                const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async interaction => {
                    // Kullanıcı butona tıkladığında yapılacak işlemler
                    if (interaction.customId === 'yes') {
                        // Doğru butonuna tıklandığında
                        try {
                            // Yeni görevi görevler listesine ekle
                            görevler.push(yeniGörev);

                            // Güncellenmiş görevleri JSON dosyasına yaz
                            fs.writeFileSync('görevler.json', JSON.stringify(görevler, null, 2)); // Dataları alt alta yazmak için null ve 2 parametreleri kullanılır

                            // Görev eklendi mesajını gönderme
                            interaction.reply({ content: `Görevi başarıyla ekledin.`, ephemeral: true });
                            message.reply({ content: `${message.author} adlı kullanıcı görevi başarıyla ekledi.`, ephemeral: true });

                        } catch (err) {
                            console.error('Görev eklenirken bir hata oluştu:', err);
                            message.reply({ content: 'Görev eklenirken bir hata oluştu. Lütfen tekrar deneyin.', ephemeral: true });
                        }
                    } else if (interaction.customId === 'no') {
                        // Yanlış butonuna tıklandığında
                        sentMessage.delete().catch(console.error); // Gönderilen mesajı silme
                        interaction.reply({ content: `Görevi ekleme işlemini başarıyla iptal ettin.`, ephemeral: true });
                        message.reply({ content: `${message.author} adlı kullanıcı görev ekleme işlemini iptal etti.`, ephemeral: true });
                    }
                });

                collector.on('end', () => {
                    // Mesajı düzenleme işlemi yaparken hata almamak için mesajın varlığını kontrol et
                    if (!sentMessage.deleted) {
                        sentMessage.edit({ components: [] }).catch(console.error); // Butonları kaldır
                    }
                });
            })
            .catch(err => console.error('Mesaj gönderilirken bir hata oluştu:', err));
    }
};
