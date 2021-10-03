import {
	AudioPlayer,
	AudioPlayerStatus,
	createAudioPlayer,
	VoiceConnection,
} from '@discordjs/voice'
import {
	InteractionCollector,
	Message,
	MessageComponentInteraction,
} from 'discord.js'
import { VookaClient } from '../Client'
import audioError from '../Events/AudioEvents/audioError'
import audioStateChange from '../Events/AudioEvents/audioStateChange'
import voiceStateChange from '../Events/VoiceEvents/voiceStateChange'
import { Strings } from '../Strings'
import { cleanSongTitle } from '../util'
import { Track } from './Track'
export default class MusicSubscribtion {
	public readonly voiceConnection: VoiceConnection
	public readonly audioPlayer: AudioPlayer
	public track: Track | undefined
	public readyLock: boolean = false
	public queueLock: boolean = false
	public client: VookaClient

	public constructor(client: VookaClient, voiceConnection: VoiceConnection) {
		this.client = client
		this.voiceConnection = voiceConnection
		this.audioPlayer = createAudioPlayer()
		this.voiceConnection.on('stateChange', voiceStateChange.bind(null, this))
		this.audioPlayer.on('stateChange', audioStateChange.bind(null, this))
		this.audioPlayer.on('error', audioError)
		this.voiceConnection.subscribe(this.audioPlayer)
	}
	public start(track: Track) {
		this.track = track
		void this.processQueue()
	}
	public stop() {
		this.audioPlayer.stop(true)
	}
	public async destroy(guildId: string) {
		this.client.subscribtions.delete(guildId)
		await this.track?.onDestroy()
		this.voiceConnection.destroy()
	}
	public async addComponentCollector(
		collector: InteractionCollector<MessageComponentInteraction>
	) {
		collector.on('collect', async (interaction) => {
			if (!this.track) return
			try {
				await interaction.deferReply()
				this.track.interaction = interaction
				if (interaction.customId === 'stop') {
					collector.stop()
					await this.destroy(interaction.guildId as string)
				} else if (interaction.customId === 'next') {
					this.stop()
				} else if (interaction.customId === 'pause') {
					this.audioPlayer.pause()
				} else if (interaction.customId === 'play') {
					this.audioPlayer.unpause()
				} else if (interaction.customId === 'lyrics') {
					try {
						if (this.track.lyricsMessages) {
							return await interaction.deleteReply()
						}
						const lyrics = await this.track.resolveLyrics(this.client)
						if (!lyrics) {
							await interaction.followUp({
								content: '`No lyrics found.`',
								ephemeral: true,
							})
						} else {
							const promises = lyrics.map((x) => interaction.followUp(x))
							const messages = await Promise.all(promises)
							this.track.lyricsMessages = messages as Message[]
						}
					} catch (error) {
						console.warn(error)
						await interaction.deleteReply()
					}
				}
				return
			} catch (err) {
				return this.track?.onError(new Error(Strings.VOOKA_NOT_PLAYING))
			}
		})
	}
	public async processQueue(): Promise<void> {
		if (
			!this.track ||
			this.queueLock ||
			this.audioPlayer.state.status !== AudioPlayerStatus.Idle
		)
			return
		this.queueLock = true

		try {
			const lastIndex = this.track.playlist.songs.findIndex(
				(p) => p.id === this.track?.currentSong?.id
			)
			this.track.currentSong = this.track.playlist.songs.at(lastIndex + 1)
			if (!this.track.currentSong) {
				return this.destroy(this.track.message?.guildId as string)
			}
			const audioResource = await this.track.createRawAudioResource()
			if (!audioResource) return
			this.audioPlayer.play(audioResource)
			this.queueLock = false
		} catch (err) {
			this.client.logger.warn(err)
			this.track.onError(err as Error)
			this.queueLock = false
			return this.processQueue()
		}
	}
}
