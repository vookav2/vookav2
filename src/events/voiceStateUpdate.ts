import { ClientEvents, StageChannel, VoiceChannel, VoiceState } from 'discord.js'
import { VookaClient } from '../client'

const memberCounts = (channel: VoiceChannel | StageChannel) => {
    return channel.members.filter((member) => !member.user.bot).size
}

export const name: keyof ClientEvents = 'voiceStateUpdate'
export const execute = async function (oldState: VoiceState, newState: VoiceState) {
    const that = this as VookaClient
    const radio = that.radioSubscriptions.get(oldState.guild.id)

    if (!radio) return
    if (!radio.track) return

    const radioVoiceChannel = radio.voiceChannel
    if (!radioVoiceChannel) return
    if (oldState.member.user.bot) return

    const radioConnection = radio.voiceConnection
    
    if (
        oldState?.channelId === radioVoiceChannel.id &&
        newState?.channelId !== radioVoiceChannel.id
    ) {
        // User left the radio channel
        if (memberCounts(radioVoiceChannel) < 1) {
            // destroy the radio within 5 minutes
            setTimeout(() => {
                radioConnection.destroy()
            }, 60 * 1000)
        }
    }

    else if (
        oldState?.channelId !== radioVoiceChannel.id &&
        newState?.channelId === radioVoiceChannel.id
    ) {
        // User joined the radio channel
    }
}
