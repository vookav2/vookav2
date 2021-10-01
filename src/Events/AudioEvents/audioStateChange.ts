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
		;(oldState.resource as AudioResource<Track>).metadata.onFinish()
		void musicSubscription.processQueue()
	} else if (newState.status === AudioPlayerStatus.Playing) {
		;(newState.resource as AudioResource<Track>).metadata.onPlay()
	} else if (newState.status === AudioPlayerStatus.Paused) {
		;(newState.resource as AudioResource<Track>).metadata.onPause()
	}
}
