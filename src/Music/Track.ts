import {
	AudioResource,
	createAudioResource,
	demuxProbe,
	StreamType,
} from '@discordjs/voice'
import { TrackData, TrackEvent } from '../Interfaces/Track'
import { raw as ytdl } from 'youtube-dl-exec'
import Voosic, { Song } from 'voosic'
import { config } from '../util'

const noop = () => {}

export class Track implements TrackData {
	song: Song | undefined
	onStart: () => void
	onFinish: () => void
	onError: (error: Error) => void
	private constructor({ song, onStart, onFinish, onError }: TrackData) {
		this.song = song
		this.onStart = onStart
		this.onFinish = onFinish
		this.onError = onError
	}
	public createAudioResource(): Promise<AudioResource<Track>> {
		return new Promise((resolve, reject) => {
			const process = ytdl(
				`https://www.youtube.com/watch?v=${this.song?.id}` as string,
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
			const onError = (error: Error) => {
				if (!process.killed) process.kill()
				stream.resume()
				reject(error)
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
	public static async from(
		any: string,
		methods: Pick<Track, TrackEvent>
	): Promise<Track | null> {
		const { spotify, youtube } = Voosic({
			limit: 10,
			noExplicit: false,
			simpleResult: true,
			spotify: config.spotify,
		})

		let result: any
		let song: Song
		// let nextSongs: Song | null = null

		try {
			result = await youtube.resolve(any)
			if (!result || !Array.isArray(result)) return null
			song = result.shift() as Song
		} catch (error) {
			console.error(error)
			return null
		}

		const wrappedMethods = {
			onStart() {
				wrappedMethods.onStart = noop
				methods.onStart()
			},
			onFinish() {
				wrappedMethods.onFinish = noop
				methods.onFinish()
			},
			onError(error: Error) {
				wrappedMethods.onError = noop
				methods.onError(error)
			},
		}

		const track = new Track({
			song,
			...wrappedMethods,
		})
		return track
	}
}
