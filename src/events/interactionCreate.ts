import { ClientEvents, Interaction, Message } from 'discord.js'
import { ICommand } from '../contracts'
import { Strings } from '../strings'

export const name: keyof ClientEvents = 'interactionCreate'
export const execute = async function (interaction: Interaction) {
	if (interaction.isCommand()) {
		if (!interaction.inGuild()) return

		const command: ICommand | undefined = this.commands.get(
			interaction.commandName
		)

		if (!command) return
		await interaction.deferReply()
		command.execute.bind(this)(interaction)
	}
}
