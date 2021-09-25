import Bot from './Client'

const bot = new Bot()
bot
	.init()
	.then(() => bot.connect())
	.catch(console.warn)
