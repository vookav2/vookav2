import { Song } from 'voosic'

export type TrackEvent = 'onStart' | 'onFinish' | 'onError'
export interface TrackData {
	onStart: () => void
	onFinish: () => void
	onError: (error: Error) => void
}
