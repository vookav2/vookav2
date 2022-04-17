import { CommandInteraction, Message, MessageComponentInteraction } from 'discord.js'
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
	lyricsMessages?: Message[]

	createProbeAndAudioSource: (ytId: string) => Promise<AudioResource<ITrack>>
	pleaseSendMeTheLyrics: (message: MessageComponentInteraction) => Promise<void>
	onPrepare: () => Promise<void>
	onPlay: (isRepeated?: boolean) => Promise<void>
	onPause: (isRepeated?: boolean) => Promise<void>
	onFinish: (isRepeated?: boolean) => Promise<void>
	onDestroy: () => Promise<void>
	onError: (error: Error) => Promise<void>
	onRepeated: (isRepeated: boolean) => Promise<void>
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

type PlaylistStatuses = 'loading' | 'playing' | 'paused' | 'repeated'
export interface PlaylistEmbedOptions {
	status?: PlaylistStatuses
	currentSong?: Song
	page?: number
	perPage?: number,
	repeat?: boolean
}
