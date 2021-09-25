import { CommandInteraction, Interaction } from 'discord.js'
import VookaClient from '../../Client'
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
		await interaction.deferReply({ ephemeral: true })
		command.execute(client, interaction)
	}
}
