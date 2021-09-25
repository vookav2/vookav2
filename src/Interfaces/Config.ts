interface DiscordConfig {
	token: string
	clientId: string
	prefix: string
	guildId?: string
}

interface SpotifyConfig {
	clientId: string
	clientSecret: string
}

export interface Config {
	discord: DiscordConfig
	spotify?: SpotifyConfig
}
