import { Interaction, Message } from 'discord.js'
import { VookaClient } from '../../Client'
import { ClientEventTypes } from '../../Interfaces/Event'

export const name: ClientEventTypes = 'interactionCreate'
export const execute = async (
	client: VookaClient,
	interaction: Interaction
): Promise<void> => {
	if (!interaction.guildId) return
	if (interaction.isCommand()) {
		const command = client.commands.get(interaction.commandName)
		if (!command) return
		await interaction.deferReply()
		command.execute(client, interaction)
	}

	if (interaction.isButton()) {
		const subscribtion = client.subscribtions.get(interaction.guildId)
		if (
			!subscribtion ||
			subscribtion.track?.message?.id !== interaction.message.id
		) {
			;(interaction.message as Message).delete()
		}
	}
	return
}
