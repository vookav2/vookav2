import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, Message } from 'discord.js'
import VookaClient from '../../Client'

export const data = new SlashCommandBuilder()
	.setName('pause')
	.setDescription('Pauses the song that is currently playing')
	.setDefaultPermission(true)
export const execute = async (
	client: VookaClient,
	message: Message | CommandInteraction
): Promise<void> => {
	if (message instanceof CommandInteraction) {
		const subscribtion = client.subscribtions.get(message.guildId as string)
		if (subscribtion) {
			try {
				subscribtion.audioPlayer.pause()
				await message.followUp({ content: `Paused!`, ephemeral: true })
			} catch (error) {}
		}
	}
}
