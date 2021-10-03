import { Song } from 'voosic'
import { createPlaylistEmbedOptions } from '../Helpers/EmbedBuilder'
import { Track } from '../Music/Track'
import { wait } from '../util'

export const onStart = (track: Track) => {
	const messageOptions = createPlaylistEmbedOptions(track.playlist, {
		currentSong: track.currentSong,
		status: 'playing',
	})
	track.message?.edit(messageOptions)
	if (track.interaction) {
		track.interaction.deleteReply()
			.then(() => {
				track.interaction = undefined
			})
	}
}

export const onPause = (track: Track) => {
	const messageOptions = createPlaylistEmbedOptions(track.playlist, {
		currentSong: track.currentSong,
		status: 'paused',
	})
	track.message?.edit(messageOptions)
	if (track.interaction) {
		track.interaction.deleteReply()
			.then(() => {
				track.interaction = undefined
			})
	}
}

export const onFinish = (track: Track) => {
	if (track.lyricsMessages) {
		Promise.all(track.lyricsMessages.map(async (x) => await x.delete())).then(() => {
			track.lyricsMessages = undefined
		})
	}
}

export const onError = (track: Track, error: Error) => {}

export const onDestroy = async (track: Track) => {
	await track.message
		?.edit({ content: 'Stopped!', embeds: [], components: [] })
		.then(async (message) => {
			await wait(1e3)
			if (track.interaction) {
				await track.interaction.deleteReply()
			}
			if (track.lyricsMessages) {
				await Promise.all(track.lyricsMessages.map(async (x) => await x.delete()))
			}
			return await message.delete()
		})
		.catch(() => {})
}
