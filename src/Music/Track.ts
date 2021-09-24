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
import { debug } from 'console'

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
	public async createAudioResource(): Promise<AudioResource<Track>> {
		return createAudioResource(
			'https://r1---sn-hq2gph5-jb3l.googlevideo.com/videoplayback?expire=1632478626&ei=QlFNYafuJMXCpgeFq7n4Bw&ip=103.124.138.137&id=o-AByjcLZiztSeCxeLmYvL3JZaDZARuBmEpqD12U7abQ-2&itag=251&source=youtube&requiressl=yes&mh=XQ&mm=31%2C29&mn=sn-hq2gph5-jb3l%2Csn-cp1oxu-jb3e&ms=au%2Crdu&mv=m&mvi=1&pl=24&initcwndbps=131250&vprv=1&mime=audio%2Fwebm&ns=8dw0d4cJAEGm9R8NY-bAhAAG&gir=yes&clen=3808319&dur=226.901&lmt=1576353227339767&mt=1632456764&fvip=1&keepalive=yes&fexp=24001373%2C24007246&beids=9466585&c=WEB&txp=5531432&n=TjV9O6dRD8BGtws&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRAIgIzdRIXBW_uL6YqMPN1X2IHAtY2qK02rXLxUB2ExEmLECIEjLwI1fdU4bWQTlxfQPklB880HnbqhFA5KqqIo9SH-U&sig=AOq0QJ8wRAIgB4FCemFMmVXyR_9WjYVc6Maox_DUPwDQzUbU-qLCRXQCICh7TJu2VJR-z0IPL4YdJt4PA8QC1eQy1fL5f3UuT9E-',
			{
				metadata: this,
				inputType: StreamType.WebmOpus
			}
		)
	}
	// public createAudioResource(): Promise<AudioResource<Track>> {
	// 	return new Promise((resolve, reject) => {
	// 		const process = ytdl(
	// 			`https://www.youtube.com/watch?v=${this.song?.id}` as string,
	// 			{
	// 				o: '-',
	// 				q: '',
	// 				f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
	// 				r: '100K',
	// 			},
	// 			{ stdio: ['ignore', 'pipe', 'ignore'] }
	// 		)
	// 		debug(process)
	// 		if (!process.stdout) {
	// 			reject(new Error('No stdout'))
	// 			return
	// 		}
	// 		const stream = process.stdout
	// 		const onError = (error: Error) => {
	// 			if (!process.killed) process.kill()
	// 			stream.resume()
	// 			reject(error)
	// 		}
	// 		process
	// 			.once('spawn', () => {
	// 				debug(stream)
	// 				demuxProbe(stream)
	// 					.then((probe) =>
	// 						resolve(
	// 							createAudioResource(probe.stream, {
	// 								metadata: this,
	// 								inputType: probe.type,
	// 							})
	// 						)
	// 					)
	// 					.catch(onError)
	// 			})
	// 			.catch(onError)
	// 	})
	// }
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
