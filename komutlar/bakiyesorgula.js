const fs = require('fs');
const { MessageEmbed, MessageMentions } = require('discord.js');

module.exports = {
    name: 'bakiyesorgula',
    description: 'Belirtilen kullanıcının bakiyesini sorgular',
    execute(message, args) {
        // Etiketlenen kullanıcıyı al
        const etiketlenenKullanıcı = message.mentions.users.first();
        if (!etiketlenenKullanıcı) return message.reply('Bir kullanıcı etiketleyin!');

        // Kullanıcı ID'sini al
        const kullanıcıID = etiketlenenKullanıcı.id;

        // Kullanıcıların bakiyelerini tutan dosyayı oku
        let cüzdan = {};
        try {
            const data = fs.readFileSync('cüzdan.json', 'utf8');
            cüzdan = JSON.parse(data);
        } catch (err) {
            console.error('Cüzdan dosyası okunurken bir hata oluştu:', err);
            return message.reply('Cüzdan dosyası okunurken bir hata oluştu.');
        }

        // Kullanıcının cüzdanını kontrol et
        if (!cüzdan[kullanıcıID]) {
            return message.reply('Bu kullanıcının henüz bir cüzdanı yok!');
        }

        // Kullanıcının bakiyesini al
        const cashBakiye = cüzdan[kullanıcıID].cash || 0;
        const tokenBakiye = cüzdan[kullanıcıID].token || 0;

        // Kullanıcı adını etiketleyerek göster
        const etiketliKullanıcıAdı = MessageMentions.USERS_PATTERN.test(args[0]) ? args[0] : `<@${etiketlenenKullanıcı.id}>`;
        const kullanıcıAdı = `**${etiketliKullanıcıAdı}**`;

        // Bakiye bilgisini embed olarak gönder
        const embed = new MessageEmbed()
            .setColor('#00ff00')
            .setTitle(`BAKİYE SORGULAMA EKRANI`)
            .setDescription(`${kullanıcıAdı}'nin bakiyesi`)
            .addField('**Cash**', cashBakiye.toString(), true)
            .addField('**Token**', tokenBakiye.toString(), true)
            .setImage('https://cdn.discordapp.com/attachments/1235377927038697472/1235641771283714170/IMG_4320.png?ex=6637bf93&is=66366e13&hm=be256ed7ebce341f87c1fb7353292198c6a9bd2fa4684620122972d7dbf3322c&')
            .setTimestamp()

        message.channel.send({ embeds: [embed] });
    }
};
