import { AudioPlayerError, AudioResource } from '@discordjs/voice'
import { Track } from '../../Music/Track'

export default function (error: AudioPlayerError): void {
	(error.resource as AudioResource<Track>).metadata.onError(error)
}
