import {
	entersState,
	joinVoiceChannel,
	VoiceConnection,
	VoiceConnectionStatus,
} from '@discordjs/voice'
import { GuildMember } from 'discord.js'
import { VookaClient } from '.'
import { Strings } from '../strings'

export default class VoiceManager {
	private ctx: VookaClient

	public constructor(_ctx: VookaClient) {
		this.ctx = _ctx
	}

	public async createVoiceConnection(member: GuildMember) {
		if (!member.voice.channel) throw new Error(Strings.MEMBER_NO_VOICE_CHANNEL)

		const voiceChannel = member.voice.channel
		const voiceConnection = joinVoiceChannel({
			guildId: voiceChannel.guildId,
			channelId: voiceChannel.id,
			adapterCreator: voiceChannel.guild.voiceAdapterCreator,
			selfDeaf: true,
			selfMute: false,
		})
		voiceConnection.on('error', this.ctx.logger.error)
		try {
			return await entersState(
				voiceConnection,
				VoiceConnectionStatus.Ready,
				20e3
			)
		} catch {
			throw new Error(Strings.VOICE_CONNECTING_TIMEOUT)
			voiceConnection.destroy()
		}
	}
}
