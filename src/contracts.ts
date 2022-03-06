import { CommandInteraction, Message } from 'discord.js'
import { AudioResource } from '@discordjs/voice'
import { SlashCommandBuilder } from '@discordjs/builders'
import { Artist, Album, Playlist, Song } from 'voosic'
import { VookaClient } from './client'

export interface IConfig {
	token: string
	clientId: string
}

export interface ILyrics {
	lyricMessages?: Message[]
}

export interface ITrack {
	ctx: VookaClient
	metadata?: Song
	playlist: Playlist
	guildId: string | null
	trackMessage?: Message

	createProbeAndAudioSource: (ytId: string) => Promise<AudioResource<ITrack>>
	onPrepare: () => Promise<void>
	onPlay: () => Promise<void>
	onPause: () => Promise<void>
	onFinish: () => Promise<void>
	onDestroy: () => Promise<void>
	onError: (error: Error) => Promise<void>
}

export interface ICommand {
	data: SlashCommandBuilder
	execute: (interaction: CommandInteraction) => Promise<void>
}

export interface IEvent {
	name: string
	once?: boolean
	execute: () => Promise<void>
}

type PlaylistStatuses = 'loading' | 'playing' | 'paused'
export interface PlaylistEmbedOptions {
	status?: PlaylistStatuses
	currentSong?: Song
	page?: number
	perPage?: number
}
