import { ClientEvents } from 'discord.js'

export const name: keyof ClientEvents = 'ready'
export const once = true
export const execute = async function () {
	this.logger.success(`[Vooka Client] [${this.user?.tag}] is ONLINE.`)
}
