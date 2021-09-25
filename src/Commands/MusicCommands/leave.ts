import {
	SlashCommandBuilder,
} from '@discordjs/builders'
import {
	CommandInteraction,
	Message,
} from 'discord.js'
import VookaClient from '../../Client'

export const data = new SlashCommandBuilder()
	.setName('leave')
	.setDescription('Leave the voice channel')
	.setDefaultPermission(true)
export const execute = async (
	client: VookaClient,
	message: Message | CommandInteraction
): Promise<void> => {
	if (message instanceof CommandInteraction) {
		const subscribtion = client.subscribtions.get(message.guildId as string)
    if (subscribtion){
      try {
        subscribtion.voiceConnection.destroy()
        client.subscribtions.delete(message.guildId as string)
        await message.followUp({content: `Left channel!`, ephemeral: true})
      } catch (error) {}
    }
	}
}
