import {
	AudioResource,
	createAudioResource,
	demuxProbe,
	StreamType,
} from '@discordjs/voice'
import { TrackData, TrackEvent } from '../Interfaces/Track'
import { raw as ytdl } from 'youtube-dl-exec'
import Voosic, { Song, createStreamUrl, Playlist, Album, Artist } from 'voosic'
import { config } from '../util'

const noop = () => {}

export class Track implements TrackData {
	song!: Song | undefined
	nextSongs!: Song[]
	onStart: () => void
	onFinish: () => void
	onError: (error: Error) => void
	private constructor({ onStart, onFinish, onError }: TrackData) {
		this.onStart = onStart
		this.onFinish = onFinish
		this.onError = onError
	}
	public async createAudioResource(): Promise<AudioResource<Track>> {
		const youtubeId = await this.song?.getYoutubeId()
		const streamUrl = await createStreamUrl(youtubeId as string)
		return createAudioResource(
			streamUrl as string,
			{
				metadata: this,
				inputType: StreamType.WebmOpus
			}
		)
	}
	public async createRawAudioResource(): Promise<AudioResource<Track>>{
		return new Promise(async (resolve, reject) => {
			const youtubeId = await this.song?.getYoutubeId()
			if (youtubeId) reject(new Error("Cannot create audio resource"));
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
	public static async from(
		any: string,
		methods?: Pick<Track, TrackEvent>
	): Promise<Track |null> {
		const wrappedMethods = {
			onStart() {
				wrappedMethods.onStart = noop
				methods?.onStart()
			},
			onFinish() {
				wrappedMethods.onFinish = noop
				methods?.onFinish()
			},
			onError(err: Error) {
				wrappedMethods.onError = noop
				methods?.onError(err)
			},
		}
		const track = new Track(wrappedMethods)
		const voosic = Voosic({spotify: config.spotify})
		const res = await voosic(any)
		if (res instanceof Song){
			track.song = res
			if (res.nextSongs?.length){
				track.nextSongs = res.nextSongs
				res.nextSongs = res.nextSongs.slice(0,0)
			}
			return track
		}
		if(res instanceof Playlist && res.songs?.length){
			track.song = res.songs.shift()
			track.nextSongs = res.songs
			return track
		}
		if(res instanceof Album && res.songs?.length){
			track.song = res.songs.shift()
			track.nextSongs = res.songs
			return track
		}
		if(res instanceof Artist && res.songs?.length) {
			track.song = res.songs.shift()
			track.nextSongs = res.songs
			return track
		}
		return null
	}
}
