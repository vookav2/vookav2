import {
	SlashCommandBuilder,
} from '@discordjs/builders'
import {
	CommandInteraction,
	Message,
} from 'discord.js'
import VookaClient from '../../Client'

export const data = new SlashCommandBuilder()
	.setName('resume')
	.setDescription('Resume playback of the current song')
	.setDefaultPermission(true)
export const execute = async (
	client: VookaClient,
	message: Message | CommandInteraction
): Promise<void> => {
	if (message instanceof CommandInteraction) {
		const subscribtion = client.subscribtions.get(message.guildId as string)
    if (subscribtion){
      try {
        subscribtion.audioPlayer.unpause()
        await message.followUp({content: `Unpaused!`, ephemeral: true})
      } catch (error) {}
    }
	}
}
