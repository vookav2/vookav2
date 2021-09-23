import { VoiceConnectionStatus } from '@discordjs/voice'
import { ClientEvents, Message } from 'discord.js'
import ExtendedDiscordClient from '../Client'

export type ClientEventTypes = keyof ClientEvents
export interface ExecuteEvent {
	<T extends ClientEventTypes>(
		client: ExtendedDiscordClient,
		...args: ClientEvents[T]
	): Promise<void>
}
export interface Event {
	name: ClientEventTypes
	once?: boolean
	execute: ExecuteEvent
}
