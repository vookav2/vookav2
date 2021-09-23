import { Guild } from 'discord.js'
import ExtendedDiscordClient from '../../Client'
import { ClientEventTypes, ExecuteEvent } from '../../Interfaces/Event'

export const name: ClientEventTypes = 'guildCreate'
export const execute = async (
	client: ExtendedDiscordClient,
	guild: Guild
): Promise<void> => {}
