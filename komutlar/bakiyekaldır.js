const fs = require('fs');
const { MessageEmbed } = require('discord.js');

// Yetkilendirilecek rollerin ID'leri
const yetkiliRolleri = ['1235417562171441192', '1235417562171441192', '1235417562171441192'];

module.exports = {
    name: 'bakiyekaldır',
    description: 'Belirli bir kullanıcının bakiyesinden miktarı kaldırır',
    execute(message, args) {
        // Komutu sadece yetkili roller kullanabilir
        if (!message.member.roles.cache.some(role => yetkiliRolleri.includes(role.id))) {
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription('Bu komutu kullanmaya yetkiniz yok.');
            return message.reply({ embeds: [embed] });
        }

        // Komutun doğru kullanımını kontrol et
        if (args.length !== 3) {
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription('Komutu doğru kullanın. Örnek: `!bakiyekaldır @kullanıcıadı, Miktar(100), Tür(Cash veya Token)`');
            return message.reply({ embeds: [embed] });
        }

        // Kullanıcıyı ve miktarı al
        const kullanıcı = message.mentions.users.first();
        const miktarArg = args[1].trim();
        const tür = args[2].trim().toLowerCase();

        // Miktarın geçerli bir sayı olup olmadığını kontrol et
        const miktar = parseInt(miktarArg);
        if (isNaN(miktar) || miktar <= 0) {
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription('Geçersiz miktar. Miktarı doğru bir şekilde belirtin. (Örneğin: 100)');
            return message.reply({ embeds: [embed] });
        }

        // Türün "cash" veya "token" olduğunu kontrol et
        if (!['cash', 'token'].includes(tür)) {
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription('Geçersiz tür. Türü doğru bir şekilde belirtin. (Örneğin: Cash veya Token)');
            return message.reply({ embeds: [embed] });
        }

        // Kullanıcının cüzdanını oku
        let cüzdan = {};
        try {
            const data = fs.readFileSync('cüzdan.json', 'utf8');
            cüzdan = JSON.parse(data);
        } catch (err) {
            console.error('Cüzdan dosyası okunurken bir hata oluştu:', err);
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription('Cüzdan dosyası okunurken bir hata oluştu.');
            return message.reply({ embeds: [embed] });
        }

        // Kullanıcının cüzdanından miktarı kaldır
        if (!cüzdan[kullanıcı.id]) {
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription(`${kullanıcı.username} adlı kullanıcının cüzdanı bulunamadı.`);
            return message.reply({ embeds: [embed] });
        }

        if (tür === 'cash') {
            if (cüzdan[kullanıcı.id].cash < miktar) {
                const embed = new MessageEmbed()
                    .setColor('#ff0000')
                    .setDescription(`${kullanıcı.username} adlı kullanıcının yeterli nakit parası yok.`);
                return message.reply({ embeds: [embed] });
            }
            cüzdan[kullanıcı.id].cash -= miktar;
        } else {
            if (cüzdan[kullanıcı.id].token < miktar) {
                const embed = new MessageEmbed()
                    .setColor('#ff0000')
                    .setDescription(`${kullanıcı.username} adlı kullanıcının yeterli tokeni yok.`);
                return message.reply({ embeds: [embed] });
            }
            cüzdan[kullanıcı.id].token -= miktar;
        }

        // Cüzdan JSON dosyasına yaz
        try {
            fs.writeFileSync('cüzdan.json', JSON.stringify(cüzdan, null, 2));
            const embed = new MessageEmbed()
                .setColor('#00ff00')
                .setDescription(`${kullanıcı.username} adlı kullanıcının ${miktar} ${tür} parası başarıyla kaldırıldı.`);
            message.reply({ embeds: [embed] });
        } catch (err) {
            console.error('Cüzdan dosyasına yazılırken bir hata oluştu:', err);
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription('Cüzdan dosyasına yazılırken bir hata oluştu.');
            return message.reply({ embeds: [embed] });
        }
    }
};
