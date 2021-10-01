import { SlashCommandBuilder } from '@discordjs/builders'
import { Client, Interaction, Message } from 'discord.js'
import VookaClient from '../Client'
import { DiscordConfig } from './Config'

interface Run {
	<X>(client: Client, message?: X, args?: string[]): Promise<void>
}

export interface Command {
	data: SlashCommandBuilder
	aliases?: string[]
	guildOnly?: boolean
	execute: Run
}

export interface CommandManagerOptions {
	discord?: DiscordConfig
}
