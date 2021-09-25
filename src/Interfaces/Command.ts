import { SlashCommandBuilder } from '@discordjs/builders'
import { Client, Interaction, Message } from 'discord.js'

interface Run {
	<X>(client: Client, message?: X, args?: string[]): Promise<void>
}

export interface Command {
	data: SlashCommandBuilder
	aliases?: string[]
	guildOnly?: boolean
	execute: Run
}
