export interface DiscordConfig {
	token: string
	clientId: string
	prefix: string
	guildId?: string
}

export interface SpotifyConfig {
	clientId: string
	clientSecret: string
}

export interface Config {
	discord: DiscordConfig
	spotify?: SpotifyConfig
}
