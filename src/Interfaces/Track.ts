import { Message } from 'discord.js'
import { Album, Artist, Playlist, Song } from 'voosic'
import { Track } from '../Music/Track'

export type TrackEvent = 'onStart' | 'onFinish' | 'onError'
export type RosourceType = Song | Playlist | Artist | Album
export interface TrackEvents {
	onPlay(): void
	onPause(): void
	onFinish(): void
	onError(error: Error): void
	onDestroy(): Promise<void>
}
export interface TrackData {
	resource: RosourceType
	currentSong?: Song
	message?: Message
}
