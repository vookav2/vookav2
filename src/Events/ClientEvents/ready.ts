import { VookaClient } from '../../Client'
import { ClientEventTypes } from '../../Interfaces/Event'

export const name: ClientEventTypes = 'ready'
export const once = true
export const execute = async (client: VookaClient): Promise<void> => {
	client.logger.success(`Discord: [${client.user?.tag}] is ONLINE.`)
	await client.commandManager.refreshCommands()
}
