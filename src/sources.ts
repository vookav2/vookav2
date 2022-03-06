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
import { Message } from 'discord.js'
import { createPlaylistEmbedOptions } from './utils'

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
					if (!raw.killed) raw.kill()
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
		onPrepare: async function () {
			this.trackMessage = await message(playlist)
			this.guildId = this.trackMessage?.guildId
		},
		onPlay: async function () {
			if (this.trackMessage) {
				const embed = createPlaylistEmbedOptions(playlist, {
					currentSong: this.metadata,
					status: 'playing',
				})
				this.trackMessage = await this.trackMessage.edit(embed)
			}
		},
		onPause: async function () {
			if (this.trackMessage) {
				const embed = createPlaylistEmbedOptions(playlist, {
					currentSong: this.metadata,
					status: 'paused',
				})
				this.trackMessage = await this.trackMessage.edit(embed)
			}
		},
		onFinish: async function () {
			// if (this.lyrics?.lyricMessages?.length) {
			// }
		},
		onDestroy: async function () {
			await this.trackMessage?.delete()
			await this.onFinish()
			this.ctx.radioSubscriptions.delete(this.guildId as string)
		},
		onError: async function (err: Error) {
			if (this.ctx.logger) this.ctx.logger.error(`[createTrack] ${err}`)
			else console.error(err)
			await this.onFinish()
		},
	}

	await track.onPrepare()

	return track
}