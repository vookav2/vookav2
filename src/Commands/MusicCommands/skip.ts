import {
	SlashCommandBuilder,
	SlashCommandStringOption,
} from '@discordjs/builders'
import { CommandInteraction, Message } from 'discord.js'
import VookaClient from '../../Client'

export const data = new SlashCommandBuilder()
	.setName('skip')
	.setDescription('Skip to the next song in the queue.')
	.setDefaultPermission(true)
export const execute = async (
	client: VookaClient,
	message: Message | CommandInteraction
): Promise<void> => {
	if (message instanceof CommandInteraction) {
		const subscribtion = client.subscribtions.get(message.guildId as string)
		if (subscribtion) {
			try {
				subscribtion.audioPlayer.stop()
				await message.followUp({ content: `Skipped song!`, ephemeral: true })
			} catch (error) {}
		}
	}
}
