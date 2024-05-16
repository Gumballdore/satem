const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'görevbitir',
    description: 'Kullanıcının görev bilgilerini belirli bir kanala gönderir',
    execute(message, args) {
        // Hedef kanalın ID'sini buraya yazın
        const targetChannelID = '1235417259774574652';

        // Yanlış kullanım uyarısı
        if (args.length !== 1) {
            return message.reply('Komutu yanlış kullandınız. Doğru kullanım: `!görevbitir görevkodu`');
        }

        // Görev kodunu al
        const görevKodu = args[0];

        // Görevleri JSON dosyasından oku
        let kullanıcıgörevler = {};
        try {
            const data = fs.readFileSync('kullanıcıgörevler.json', 'utf8');
            kullanıcıgörevler = JSON.parse(data);
        } catch (err) {
            console.error('kullanıcıgörevler dosyası okunurken bir hata oluştu:', err);
            return message.reply('kullanıcıgörevler dosyası okunurken bir hata oluştu.');
        }

        // Kullanıcının aldığı görevi bul
        const userTasks = kullanıcıgörevler[message.author.id] || [];
        const görev = userTasks.find(task => task.görev.görevKodu === görevKodu);

        if (!görev) {
            return message.reply('Belirtilen görev koduna sahip bir görev bulunamadı.');
        }

        // Görevi hedef kanala gönder
        const embed = new MessageEmbed()
            .setColor('#00ff00')
            .setTitle('Görev Bitirildi')
            .setDescription('Kullanıcı görevi bitirdi.')
            .addField('Kullanıcı', `<@${message.author.id}>`)
            .addField('Görev Kodu', görev.görev.görevKodu)
            .addField('Görev Adı', görev.görev.görevAdı)
            .addField('Açıklama', görev.görev.açıklama)
            .addField('Ödül', görev.görev.ödül)
            .setImage('https://cdn.discordapp.com/attachments/1235377927038697472/1235641771283714170/IMG_4320.png?ex=6637bf93&is=66366e13&hm=be256ed7ebce341f87c1fb7353292198c6a9bd2fa4684620122972d7dbf3322c&')
            .setTimestamp()
            .setFooter('Görevi onaylamak için yeşil butona, reddetmek için kırmızı butona tıklayın.');

        const targetChannel = message.client.channels.cache.get(targetChannelID);
        if (!targetChannel) {
            console.error('Hedef kanal bulunamadı.');
            return;
        }

        const filter = (interaction) => {
            return interaction.user.id === message.author.id;
        };

        const collector = targetChannel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'onayla') {
                // Görev onaylanırsa yapılacaklar
                interaction.reply({ content: `Görevi onaylandı bakiye kullanıcıya aktarıldı.`, ephemeral: true });
                targetChannel.send(`${message.author} adlı kullanıcı ${görev.görev.görevKodu} kodlu görevi onayladı ve ödül kullanıcıya aktarıldı.`);
                message.author.send(`${görev.görev.görevKodu} kodlu göreviniz onaylandı ve bakiyenize aktarıldı!`);

        
                // Kullanıcıya ödül verme işlemi
                // Örneğin: Kullanıcının cüzdanına ödül miktarı kadar cash veya token eklenebilir
                const ödül = görev.görev.ödül;
                if (ödül.includes('cash') || ödül.includes('token')) {
                    if (!fs.existsSync('cüzdan.json')) {
                        fs.writeFileSync('cüzdan.json', '{}');
                    }
                    let cüzdan = JSON.parse(fs.readFileSync('cüzdan.json', 'utf8'));
                    if (!cüzdan[message.author.id]) {
                        cüzdan[message.author.id] = { cash: 0, token: 0 };
                    }
                    const miktar = parseInt(ödül); // Ödül miktarını tam sayıya dönüştür
                    if (!isNaN(miktar)) {
                        if (ödül.includes('cash')) {
                            cüzdan[message.author.id].cash += miktar;
                        } else if (ödül.includes('token')) {
                            cüzdan[message.author.id].token += miktar;
                        }
                    }
                    fs.writeFileSync('cüzdan.json', JSON.stringify(cüzdan, null, 4));
                }
        
            } else if (interaction.customId === 'reddet') {
                // Görev reddedilirse yapılacaklar
                interaction.reply({ content: `Görevi reddettin kullanıcıya özelden bilgilendirme yapıldı.`, ephemeral: true });
                targetChannel.send(`${message.author} adlı kullanıcı ${görev.görev.görevKodu} kodlu görevi reddetti!`);
                message.author.send(`${görev.görev.görevKodu} kodlu göreviniz reddedildi!`);
            }
        });

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('onayla')
                    .setLabel('Onayla ve bakiyeyi yükle')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('reddet')
                    .setLabel('Görevi Reddet')
                    .setStyle('DANGER')
            );

        targetChannel.send({ embeds: [embed], components: [row] })
            .then(() => {
                message.reply('Görev bilgileriniz başarıyla gönderildi.');
            })
            .catch(error => {
                console.error('Embed gönderirken bir hata oluştu:', error);
                message.reply('Görev bilgilerinizi gönderirken bir hata oluştu. Lütfen tekrar deneyin.');
            });
    }
};
