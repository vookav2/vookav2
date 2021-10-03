import {
	AudioResource,
	createAudioResource,
	demuxProbe,
	StreamType,
} from '@discordjs/voice'
import { raw as ytdl } from 'youtube-dl-exec'
import Voosic, { Song, Playlist, SpotifyCredentials } from 'voosic'
import { cleanSongTitle, config } from '../util'
import { TrackData } from '../Interfaces'
import { RosourceType, TrackEvents } from '../Interfaces/Track'
import { Strings } from '../Strings'
import { Message, MessageComponentInteraction } from 'discord.js'
import * as trackEvents from '../Events/track'
import { createLyricsContent } from '../Helpers/EmbedBuilder'
import songlyrics, { Lyrics } from 'songlyrics'
import { VookaClient } from '../Client'
export class Track implements TrackData, TrackEvents {
	public resource: RosourceType
	public currentSong: Song | undefined
	public message: Message | undefined
	public lyricsMessages: Message[] | undefined
	public interaction: MessageComponentInteraction | undefined

	public constructor({ resource }: TrackData) {
		this.resource = resource
	}
	public onDestroy(): Promise<void> {
		return trackEvents.onDestroy(this)
	}
	public onPlay(): void {
		trackEvents.onStart(this)
	}
	public onPause(): void {
		trackEvents.onPause(this)
	}
	public onFinish(): void {
		trackEvents.onFinish(this)
	}
	public onError(error: Error): void {
		trackEvents.onError(this, error)
	}
	public async resolveLyrics(client: VookaClient): Promise<string[] | undefined> {
		if (!this.currentSong) return
		if (!this.message) return
		const songTitle = cleanSongTitle(this.currentSong.title)
		if (client.cache.has(songTitle)){
			console.log('Get lyrics from cache')
			return createLyricsContent(client.cache.get(songTitle) as Lyrics, this.currentSong)
		}
		const lyrics = await songlyrics(songTitle)
		if (!lyrics.lyrics) return undefined
		client.cache.set(songTitle, lyrics)
		return createLyricsContent(lyrics, this.currentSong)
	}
	public async createRawAudioResource(): Promise<
		AudioResource<Track> | undefined
	> {
		if (!this.currentSong) return
		return new Promise(async (resolve, reject) => {
			const youtubeId = await this.currentSong?.getYoutubeId()
			if (!youtubeId) reject(new Error('Cannot create audio resource'))
			const process = ytdl(
				`https://www.youtube.com/watch?v=${youtubeId}` as string,
				{
					o: '-',
					q: '',
					f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
					r: '100K',
				},
				{ stdio: ['ignore', 'pipe', 'ignore'] }
			)
			if (!process.stdout) {
				reject(new Error('No stdout'))
				return
			}
			const stream = process.stdout
			const onError = (err: Error) => {
				if (!process.killed) process.kill()
				stream.resume()
				reject(err)
			}
			process
				.once('spawn', () => {
					demuxProbe(stream)
						.then((probe) =>
							resolve(
								createAudioResource(probe.stream, {
									metadata: this,
									inputType: probe.type,
								})
							)
						)
						.catch(onError)
				})
				.catch(onError)
		})
	}
	public get playlist(): Playlist {
		if (this.resource instanceof Playlist) return this.resource
		else return this.resource.playlist
	}
	public static async from(any: string): Promise<Track> {
		const voosic = Voosic({ spotify: config.spotify as SpotifyCredentials })
		return voosic(any)
			.then((response) => {
				if (!response) throw new Error(Strings.NO_MUSIC_FOUND)
				return response
			})
			.then((resource) => {
				return new Track({ resource })
			})
	}
}
