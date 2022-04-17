"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.name = void 0;
const memberCounts = (channel) => {
    return channel.members.filter((member) => !member.user.bot).size;
};
exports.name = 'voiceStateUpdate';
const execute = async function (oldState, newState) {
    const that = this;
    const radio = that.radioSubscriptions.get(oldState.guild.id);
    if (!radio)
        return;
    if (!radio.track)
        return;
    const radioVoiceChannel = radio.voiceChannel;
    if (!radioVoiceChannel)
        return;
    if (oldState.member.user.bot)
        return;
    const radioConnection = radio.voiceConnection;
    if (oldState?.channelId === radioVoiceChannel.id &&
        newState?.channelId !== radioVoiceChannel.id) {
        // User left the radio channel
        if (memberCounts(radioVoiceChannel) < 1) {
            // destroy the radio within 5 minutes
            setTimeout(() => {
                radioConnection.destroy();
            }, 60 * 1000);
        }
    }
    else if (oldState?.channelId !== radioVoiceChannel.id &&
        newState?.channelId === radioVoiceChannel.id) {
        // User joined the radio channel
    }
};
exports.execute = execute;
//# sourceMappingURL=voiceStateUpdate.js.map