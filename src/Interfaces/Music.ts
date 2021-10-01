import { Song } from 'voosic'
type PlaylistStatuses = 'loading' | 'playing' | 'paused'
export interface PlaylistEmbedOptions {
	status?: PlaylistStatuses
	currentSong?: Song
	page?: number
	perPage?: number
}
