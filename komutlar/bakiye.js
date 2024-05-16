const fs = require('fs');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'bakiye',
    description: 'Kullanıcının bakiyesini gösterir',
    execute(message) {
        // Kullanıcının ID'sini al
        const kullanıcı = message.author;

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

        // Kullanıcının bakiyesini göster
        const userBakiye = cüzdan[kullanıcı.id] || { cash: 0, token: 0 };
        const embed = new MessageEmbed()
            .setColor('#00ff00')
            .setTitle(`CÜZDAN BİLGİLERİ`)
            .setDescription(`Cüzdan sahibi: <@${message.author.id}>`)
            .addField('Nakit Para (Cash)', userBakiye.cash.toString(), true)
            .addField('Token', userBakiye.token.toString(), true)
            .setTimestamp()
            .setImage('https://cdn.discordapp.com/attachments/1235377927038697472/1235641771283714170/IMG_4320.png?ex=6637bf93&is=66366e13&hm=be256ed7ebce341f87c1fb7353292198c6a9bd2fa4684620122972d7dbf3322c&')
        message.reply({ embeds: [embed] });
    }
};
