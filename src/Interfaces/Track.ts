import { Song } from 'voosic'

export type TrackEvent = 'onStart' | 'onFinish' | 'onError'
export interface TrackData {
	song: Song | undefined
	onStart: () => void
	onFinish: () => void
	onError: (error: Error) => void
}
