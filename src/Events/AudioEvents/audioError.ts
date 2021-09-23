import { AudioPlayerError, AudioResource } from '@discordjs/voice'
import { Track } from '../../Music/Track'

export default function (error: AudioPlayerError): void {
	/**
	 * TODO
	 * 1. Emit song onError()
	 */
	;(error.resource as AudioResource<Track>).metadata.onError(error)
}
