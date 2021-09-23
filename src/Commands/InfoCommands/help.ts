import { Command } from '../../Interfaces'
import { SlashCommandBuilder } from '@discordjs/builders'
import ExtendedDiscordClient from '../../Client'
import { CommandInteraction, Message } from 'discord.js'

export const data = new SlashCommandBuilder()
	.setName('help')
	.setDescription('Replies bot commands')
	.setDefaultPermission(true)
export const execute = async (
	client: ExtendedDiscordClient,
	message: Message | CommandInteraction
): Promise<void> => {
	client.logger.log(message)
	if (message instanceof CommandInteraction) {
		await message.editReply({ content: 'hai juga 🖐🏼' })
	}
}
