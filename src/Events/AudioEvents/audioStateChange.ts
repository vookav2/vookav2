import {
	AudioPlayerState,
	AudioPlayerStatus,
	AudioResource,
} from '@discordjs/voice'
import MusicSubscribtion from '../../Music'
import { Track } from '../../Music/Track'

export default async function (
	musicSubscription: MusicSubscribtion,
	oldState: AudioPlayerState,
	newState: AudioPlayerState
): Promise<void> {
	if (
		newState.status === AudioPlayerStatus.Idle &&
		oldState.status !== AudioPlayerStatus.Idle
	) {
		/**
		 * TODO
		 * 1. Emit song onFinish()
		 * 2. Proses next song queue
		 */
		;(oldState.resource as AudioResource<Track>).metadata.onFinish()
		musicSubscription.processQueue()
	} else if (newState.status === AudioPlayerStatus.Playing) {
		/**
		 * TODO
		 * 1. Emit song onStart()
		 */
		;(newState.resource as AudioResource<Track>).metadata.onStart()
	}
}
