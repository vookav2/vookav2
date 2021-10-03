import { VookaClient as Bot } from './Client'

const bot = new Bot()
bot
	.init()
	.then(() => bot.connect())
	.catch(console.warn)

// https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&permissions=0&scope=bot%20applications.commands