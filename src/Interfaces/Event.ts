import { ClientEvents, Message } from 'discord.js'
import { VookaClient } from '../Client'

export type ClientEventTypes = keyof ClientEvents
export interface ExecuteEvent {
	<T extends ClientEventTypes>(
		client: VookaClient,
		...args: ClientEvents[T]
	): Promise<void>
}
export interface Event {
	name: ClientEventTypes
	once?: boolean
	execute: ExecuteEvent
}
