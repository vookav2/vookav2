import { raw as ytdl } from 'youtube-dl-exec'
import {
	demuxProbe,
	createAudioResource,
	AudioResource,
} from '@discordjs/voice'
import { ITrack } from './contracts'
import { VookaClient } from './client'
import { Youtube, Playlist } from 'voosic'
import { Strings } from './strings'
import { Message, MessageComponentInteraction } from 'discord.js'
import { createLyricsContent, createPlaylistEmbedOptions } from './utils'
import songlyrics from 'songlyrics'

const resolveQueryFromYoutube = async (query: string) => {
	return await new Youtube().resolve(query)
}

export const createTrack = async (
	ctx: VookaClient,
	query: string,
	message: (playlist: Playlist) => Promise<Message>
): Promise<ITrack> => {
	const result = await resolveQueryFromYoutube(query)
	if (!result) throw new Error(Strings.NO_MUSIC_FOUND)

	const playlist = result instanceof Playlist ? result : result.playlist

	const track: ITrack = {
		ctx,
		metadata: undefined,
		guildId: null,
		playlist,
		createProbeAndAudioSource: function (
			ytId: string
		): Promise<AudioResource<ITrack>> {
			return new Promise((resolve, reject) => {
				const raw = ytdl(
					`https://www.youtube.com/watch?v=${ytId}` as string,
					{
						o: '-',
						q: '',
						f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
						r: '100K',
					},
					{ stdio: ['ignore', 'pipe', 'ignore'] }
				)

				if (!raw.stdout) {
					return reject(new Error('[createRawSource] Invalid music information!'))
				}

				const stream = raw.stdout
				const onStreamError = (err: Error) => {
					if (!raw.killed)
						raw.kill()
					stream.resume()
					return reject(`[createRawSource] Stream error, skipped!`)
				}
				const onStreamSpawn = async () => {
					try {
						const { stream: probeStream, type } = await demuxProbe(stream)
						return resolve(
							createAudioResource(probeStream, {
								metadata: this,
								inputType: type,
							})
						)
					} catch (err) {
						return onStreamError(err as Error)
					}
				}

				raw.once('spawn', onStreamSpawn).catch(onStreamError)
			})
		},
		pleaseSendMeTheLyrics: async function(message: MessageComponentInteraction) {
			if (this.lyricMessages && this.lyricMessages.length) {
				message.deleteReply()
				return
			}
			if (this.metadata) {
				try {
					const lyrics = await songlyrics(
						this.metadata.title + ' ' + this.metadata.artistName
					)
					const splitLyrics = createLyricsContent(lyrics, this.metadata)
					this.lyricsMessages = await Promise.all(
						splitLyrics.map((x) => message.followUp(x))
					)
					return
				} catch (err) {}
			}
			if (message.deferred) {
				message.followUp(Strings.NO_LYRICS_FOUND)
			}
		},
		onPrepare: async function () {
			this.trackMessage = await message(playlist)
			this.guildId = this.trackMessage?.guildId
		},
		onPlay: async function (isRepeated: boolean = false) {
			if (this.trackMessage) {
				const embed = createPlaylistEmbedOptions(playlist, {
					currentSong: this.metadata,
					status: 'playing',
					repeat: isRepeated,
				})
				this.trackMessage = await this.trackMessage.edit(embed)
			}
		},
		onPause: async function (isRepeated: boolean = false) {
			if (this.trackMessage) {
				const embed = createPlaylistEmbedOptions(playlist, {
					currentSong: this.metadata,
					status: 'paused',
					repeat: isRepeated,
				})
				this.trackMessage = await this.trackMessage.edit(embed)
			}
		},
		onFinish: async function (isRepeated: boolean = false) {
			if (!isRepeated && this.lyricsMessages && this.lyricsMessages.length) {
				Promise.all(this.lyricsMessages.map((x) => x.delete()))
					.then(() => {
						this.lyricsMessages = []
					})
					.catch(() => {})
			}
		},
		onDestroy: async function (isRepeated: boolean = false) {
			await this.trackMessage?.delete()
			await this.onFinish()
			this.ctx.radioSubscriptions.delete(this.guildId as string)
		},
		onError: async function (err: Error) {
			if (this.ctx.logger)
				this.ctx.logger.error(`[createTrack] ${err}`)
			else
				console.error(err)
			await this.onFinish()
		},
		onRepeated: async function (isRepeated: boolean = false) {
			if (this.trackMessage) {
				const embed = createPlaylistEmbedOptions(playlist, {
					currentSong: this.metadata,
					status: 'playing',
					repeat: isRepeated,
				})
				this.trackMessage = await this.trackMessage.edit(embed)
			}
		},
	}

	await track.onPrepare()

	return track
}
