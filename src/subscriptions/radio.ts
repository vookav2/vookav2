import {
	AudioPlayer,
	AudioPlayerError,
	createAudioPlayer,
	VoiceConnection,
	VoiceConnectionDisconnectReason,
	VoiceConnectionState,
	VoiceConnectionStatus,
	entersState,
	AudioPlayerState,
	AudioPlayerStatus,
	AudioResource,
} from '@discordjs/voice'
import { InteractionCollector, MessageComponentInteraction } from 'discord.js'
import { VookaClient } from '../client'
import { ITrack } from '../contracts'
import { wait } from '../utils'

const onVoiceStateChange = async function (
	_: VoiceConnectionState,
	newState: VoiceConnectionState
) {
	switch (newState.status) {
		case VoiceConnectionStatus.Disconnected:
			if (
				newState.reason === VoiceConnectionDisconnectReason.WebSocketClose &&
				newState.closeCode === 4014
			) {
				try {
					await entersState(
						this.voiceConnection,
						VoiceConnectionStatus.Connecting,
						5_000
					)
				} catch (err) {
					this.voiceConnection.destroy()
				}
			} else if (this.voiceConnection.rejoinAttempts < 5) {
				await wait((this.voiceConnection.rejoinAttempts + 1) * 5_000)
				this.voiceConnection.rejoin()
			} else {
				this.voiceConnection.destroy()
			}
			break
		case VoiceConnectionStatus.Destroyed:
			await this.destroy()
			break
		case VoiceConnectionStatus.Signalling:
		case VoiceConnectionStatus.Connecting:
			if (!this.locked) {
				this.locked = true
				try {
					await entersState(
						this.voiceConnection,
						VoiceConnectionStatus.Ready,
						20_000
					)
				} catch (err) {
					if (
						this.voiceConnection.state.status !==
						VoiceConnectionStatus.Destroyed
					) {
						this.voiceConnection.destroy()
					}
				} finally {
					this.locked = false
				}
			}
			break
	}
}

const onAudioStateChange = async function (
	oldState: AudioPlayerState,
	newState: AudioPlayerState
) {
	switch (newState.status) {
		case AudioPlayerStatus.Idle:
			if (oldState.status !== AudioPlayerStatus.Idle) {
				;(oldState.resource as AudioResource<ITrack>).metadata.onFinish()
				this.processQueue()
			}
			break
		case AudioPlayerStatus.Playing:
			;(newState.resource as AudioResource<ITrack>).metadata.onPlay()
			break
		case AudioPlayerStatus.Paused:
			;(newState.resource as AudioResource<ITrack>).metadata.onPause()
			break
	}
}

const onAudioError = async function (err: AudioPlayerError) {}

export class Radio {
	public ctx: VookaClient
	public readonly voiceConnection: VoiceConnection
	public readonly audioPlayer: AudioPlayer
	public track: ITrack | undefined

	public locked: boolean = false
	private queueLocked: boolean = false

	public constructor(_ctx: VookaClient, _voiceConnection: VoiceConnection) {
		this.ctx = _ctx
		this.voiceConnection = _voiceConnection
		this.voiceConnection.on('stateChange', onVoiceStateChange.bind(this))

		this.audioPlayer = createAudioPlayer()
		this.audioPlayer.on('stateChange', onAudioStateChange.bind(this))
		this.audioPlayer.on('error', onAudioError.bind(this))

		this.voiceConnection.subscribe(this.audioPlayer)
	}

	public async start(_track: ITrack) {
		this.track = _track
		await this.processQueue()
	}

	public async destroy() {
		if (this.track) await this.track.onDestroy()
	}

	public addComponentCreator(
		collector: InteractionCollector<MessageComponentInteraction>
	) {
		collector.on(
			'collect',
			async (interaction: MessageComponentInteraction) => {
				if (!this.track) return
				try {
					await interaction.deferReply()
					switch (interaction.customId) {
						case 'stop':
							collector.stop()
							this.voiceConnection.destroy()
							break
						case 'next':
							this.audioPlayer.stop(true)
							break
						case 'play':
							this.audioPlayer.unpause()
							break
						case 'pause':
							this.audioPlayer.pause(true)
							break
						case 'lyrics':
							this.track.pleaseSendMeTheLyrics(interaction)
							return
					}
				} catch (err) {
					console.warn(err)
				}
				interaction.deleteReply()
			}
		)
	}

	public async processQueue() {
		if (
			!this.track ||
			this.queueLocked ||
			this.audioPlayer.state.status !== AudioPlayerStatus.Idle
		)
			return

		this.queueLocked = true

		try {
			const songIndex = this.track.playlist.songs.findIndex(
				(song) => song.id === this.track?.metadata?.id
			)
			this.track.metadata = this.track.playlist.songs.at(songIndex + 1)
			if (!this.track.metadata) {
				this.voiceConnection.destroy()
				return
			}

			console.log(this.track.metadata.id)

			const audioResource = await this.track.createProbeAndAudioSource(
				this.track.metadata.id
			)

			if (!audioResource) return
			this.audioPlayer.play(audioResource)

			this.queueLocked = false
		} catch (err) {
			this.track.onError(err as Error)
			this.queueLocked = false
			await this.processQueue()
		}
	}
}
