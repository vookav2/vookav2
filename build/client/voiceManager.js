"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const voice_1 = require("@discordjs/voice");
const strings_1 = require("../strings");
class VoiceManager {
    ctx;
    constructor(_ctx) {
        this.ctx = _ctx;
    }
    async createVoiceConnection(member) {
        if (!member.voice.channel)
            throw new Error(strings_1.Strings.MEMBER_NO_VOICE_CHANNEL);
        const voiceChannel = member.voice.channel;
        const voiceConnection = (0, voice_1.joinVoiceChannel)({
            guildId: voiceChannel.guildId,
            channelId: voiceChannel.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            selfDeaf: true,
            selfMute: false,
        });
        voiceConnection.on('error', this.ctx.logger.error);
        try {
            return await (0, voice_1.entersState)(voiceConnection, voice_1.VoiceConnectionStatus.Ready, 20e3);
        }
        catch {
            throw new Error(strings_1.Strings.VOICE_CONNECTING_TIMEOUT);
            voiceConnection.destroy();
        }
    }
}
exports.default = VoiceManager;
//# sourceMappingURL=voiceManager.js.map