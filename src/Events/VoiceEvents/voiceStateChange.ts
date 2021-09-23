import {
	entersState,
	VoiceConnectionDisconnectReason,
	VoiceConnectionState,
	VoiceConnectionStatus,
} from '@discordjs/voice'
import MusicSubscribtion from '../../Music'
import { wait } from '../../util'

export default async function (
	musicSubscribtion: MusicSubscribtion,
	oldState: VoiceConnectionState,
	newState: VoiceConnectionState
): Promise<void> {
	if (newState.status === VoiceConnectionStatus.Disconnected) {
		if (
			newState.reason === VoiceConnectionDisconnectReason.WebSocketClose &&
			newState.closeCode === 4014
		) {
			/*
        If the WebSocket closed with a 4014 code, this means that we should not manually attempt to reconnect,
        but there is a chance the connection will recover itself if the reason of the disconnect was due to
        switching voice channels. This is also the same code for the bot being kicked from the voice channel,
        so we allow 5 seconds to figure out which scenario it is. If the bot has been kicked, we should destroy
        the voice connection.
      */
			try {
				await entersState(
					musicSubscribtion.voiceConnection,
					VoiceConnectionStatus.Connecting,
					5_000
				)
			} catch (error) {
				musicSubscribtion.voiceConnection.destroy()
			}
		} else if (musicSubscribtion.voiceConnection.rejoinAttempts < 5) {
			await wait((musicSubscribtion.voiceConnection.rejoinAttempts + 1) * 5_000)
			musicSubscribtion.voiceConnection.rejoin()
		} else {
			musicSubscribtion.voiceConnection.destroy()
		}
	} else if (newState.status === VoiceConnectionStatus.Destroyed) {
		musicSubscribtion.stop()
	} else if (
		(!musicSubscribtion.readyLock &&
			newState.status === VoiceConnectionStatus.Connecting) ||
		newState.status === VoiceConnectionStatus.Signalling
	) {
		musicSubscribtion.readyLock = true
		try {
			await entersState(
				musicSubscribtion.voiceConnection,
				VoiceConnectionStatus.Ready,
				20_000
			)
		} catch {
			if (
				musicSubscribtion.voiceConnection.state.status !==
				VoiceConnectionStatus.Destroyed
			)
				musicSubscribtion.voiceConnection.destroy()
		} finally {
			musicSubscribtion.readyLock = false
		}
	}
}
