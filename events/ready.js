module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		const ayarlar = require("../ayarlar.json") 
		
		console.log(`${client.user.tag} adıyla giriş yapıldı.`);
	},
};
