import {
	entersState,
	joinVoiceChannel,
	VoiceConnection,
	VoiceConnectionStatus,
} from '@discordjs/voice'
import { GuildMember, VoiceChannel } from 'discord.js'
import { VookaClient } from '.'
import { Strings } from '../Strings'

export class VoiceManager {
	private client: VookaClient
	constructor(client: VookaClient) {
		this.client = client
	}
	public async createVoiceChannelConnection(member: GuildMember) {
		// if (!member.voice.channel) throw new Error(Strings.MEMBER_NO_VOICE_CHANNEL);
		const voiceChannelId = '762734379796529192'
		const voiceChannel = this.client.channels.cache.get(
			voiceChannelId
		) as VoiceChannel
		// const voiceChannel = member.voice.channel
		const voiceConnection = joinVoiceChannel({
			guildId: voiceChannel.guildId,
			channelId: voiceChannel.id,
			adapterCreator: voiceChannel.guild.voiceAdapterCreator,
			selfDeaf: true,
			selfMute: false,
		})
		voiceConnection.on('error', this.client.logger.warn)
		return entersState(
			voiceConnection,
			VoiceConnectionStatus.Ready,
			20e3
		).catch(() => {
			throw new Error(Strings.VOICE_CONNECTING_TIMEOUT)
		})
	}
}
