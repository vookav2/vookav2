import {
	AudioPlayer,
	AudioPlayerStatus,
	createAudioPlayer,
	VoiceConnection,
} from '@discordjs/voice'
import audioError from '../Events/AudioEvents/audioError'
import audioStateChange from '../Events/AudioEvents/audioStateChange'
import voiceStateChange from '../Events/VoiceEvents/voiceStateChange'
import { Collection } from 'discord.js'
import { Track } from './Track'

export default class MusicSubscribtion {
	public readonly voiceConnection: VoiceConnection
	public readonly audioPlayer: AudioPlayer
	public queue: Array<Track>
	public readyLock: boolean = false
	public queueLock: boolean = false

	public constructor(voiceConnection: VoiceConnection) {
		this.queue = new Array()
		this.voiceConnection = voiceConnection
		this.audioPlayer = createAudioPlayer()
		this.voiceConnection.on('stateChange', voiceStateChange.bind(null, this))
		this.audioPlayer.on('stateChange', audioStateChange.bind(null, this))
		this.audioPlayer.on('error', audioError)
		this.voiceConnection.subscribe(this.audioPlayer)
	}
	public enqueue(track: Track) {
		this.queue.push(track)
		void this.processQueue()
	}
	public stop() {
		this.queueLock = true
		this.queue = new Array()
		this.audioPlayer.stop(true)
	}
	public async processQueue(): Promise<void> {
		if (
			this.queueLock ||
			this.audioPlayer.state.status !== AudioPlayerStatus.Idle ||
			this.queue.length === 0
		) {
			return
		}
		this.queueLock = true
		const nextTrack = this.queue.shift()
		if (!nextTrack) return
		try {
			const resource = await nextTrack.createAudioResource()
			this.audioPlayer.play(resource)
			this.queueLock = false
		} catch (error) {
			console.warn(error)
			nextTrack.onError(error as Error)
			this.queueLock = false
			return this.processQueue()
		}
	}
}
