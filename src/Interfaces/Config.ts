interface DiscordConfig {
	token: string
	clientId: string
	prefix: string
}

interface SpotifyConfig {
	clientId: string
	clientSecret: string
}

export interface Config {
	discord: DiscordConfig
	spotify?: SpotifyConfig
}
