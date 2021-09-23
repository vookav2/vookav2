import { Message } from 'discord.js'
import ExtendedDiscordClient from '../../Client'
import { ClientEventTypes } from '../../Interfaces/Event'
import { config } from '../../util'

export const name: ClientEventTypes = 'messageCreate'
export const execute = async (
	client: ExtendedDiscordClient,
	message: Message
): Promise<void> => {
	if (
		!message.guild ||
		message.author.bot ||
		!message.content.startsWith(config.discord.prefix)
	)
		return
	const args = message.content
		.substring(config.discord.prefix.length)
		.trim()
		.split(/ /g)
	const commandName = args.shift()
	if (!commandName) return
	const command =
		client.commands.get(commandName) || client.aliases.get(commandName)
	if (!command) return
	command.execute(client, message, args).catch(client.logger.error)
}
