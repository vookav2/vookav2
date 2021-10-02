import { Guild } from 'discord.js'
import { VookaClient } from '../../Client/index'
import { ClientEventTypes, ExecuteEvent } from '../../Interfaces/Event'

export const name: ClientEventTypes = 'guildCreate'
export const execute = async (
	client: VookaClient,
	guild: Guild
): Promise<void> => {
	return client.commandManager.updateGuildCommands(guild.id)
}
