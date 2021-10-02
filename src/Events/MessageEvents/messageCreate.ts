import { Message } from 'discord.js'
import {VookaClient} from '../../Client/index'
import { ClientEventTypes } from '../../Interfaces/Event'
import { Track } from '../../Music/Track'
import { config } from '../../util'

export const name: ClientEventTypes = 'messageCreate'
export const execute = async (
	client: VookaClient,
	message: Message
): Promise<void> => {
	if (
		!message.guild ||
		message.author.bot
		// !message.content.startsWith(config.discord.prefix)
	)
		return

	// Track.from('twenty one pilots').then((res) => {
	// 	message.reply(res)
	// })
	// const args = message.content
	// 	.substring(config.discord.prefix.length)
	// 	.trim()
	// 	.split(/ /g)
	// const commandName = args.shift()
	// if (!commandName) return
	// const command =
	// 	client.commands.get(commandName) || client.aliases.get(commandName)
	// if (!command) return
	// command.execute(client, message, args).catch(client.logger.error)
}
