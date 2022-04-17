"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Radio = void 0;
const voice_1 = require("@discordjs/voice");
const utils_1 = require("../utils");
const onVoiceStateChange = async function (_, newState) {
    switch (newState.status) {
        case voice_1.VoiceConnectionStatus.Disconnected:
            if (newState.reason === voice_1.VoiceConnectionDisconnectReason.WebSocketClose &&
                newState.closeCode === 4014) {
                try {
                    await (0, voice_1.entersState)(this.voiceConnection, voice_1.VoiceConnectionStatus.Connecting, 5_000);
                }
                catch (err) {
                    this.voiceConnection.destroy();
                }
            }
            else if (this.voiceConnection.rejoinAttempts < 5) {
                await (0, utils_1.wait)((this.voiceConnection.rejoinAttempts + 1) * 5_000);
                this.voiceConnection.rejoin();
            }
            else {
                this.voiceConnection.destroy();
            }
            break;
        case voice_1.VoiceConnectionStatus.Destroyed:
            await this.destroy();
            break;
        case voice_1.VoiceConnectionStatus.Signalling:
        case voice_1.VoiceConnectionStatus.Connecting:
            if (!this.locked) {
                this.locked = true;
                try {
                    await (0, voice_1.entersState)(this.voiceConnection, voice_1.VoiceConnectionStatus.Ready, 20_000);
                }
                catch (err) {
                    if (this.voiceConnection.state.status !==
                        voice_1.VoiceConnectionStatus.Destroyed) {
                        this.voiceConnection.destroy();
                    }
                }
                finally {
                    this.locked = false;
                }
            }
            break;
    }
};
const onAudioStateChange = async function (oldState, newState) {
    switch (newState.status) {
        case voice_1.AudioPlayerStatus.Idle:
            if (oldState.status !== voice_1.AudioPlayerStatus.Idle) {
                ;
                oldState.resource.metadata.onFinish();
                this.processQueue();
            }
            break;
        case voice_1.AudioPlayerStatus.Playing:
            ;
            newState.resource.metadata.onPlay();
            break;
        case voice_1.AudioPlayerStatus.Paused:
            ;
            newState.resource.metadata.onPause();
            break;
    }
};
const onAudioError = async function (err) { };
class Radio {
    ctx;
    voiceConnection;
    audioPlayer;
    voiceChannel;
    track;
    isRepeated = false;
    locked = false;
    queueLocked = false;
    constructor(_ctx, _voiceConnection, _voiceChannel) {
        this.ctx = _ctx;
        this.voiceConnection = _voiceConnection;
        this.voiceChannel = _voiceChannel;
        this.voiceConnection.on('stateChange', onVoiceStateChange.bind(this));
        this.audioPlayer = (0, voice_1.createAudioPlayer)();
        this.audioPlayer.on('stateChange', onAudioStateChange.bind(this));
        this.audioPlayer.on('error', onAudioError.bind(this));
        this.voiceConnection.subscribe(this.audioPlayer);
    }
    async start(_track) {
        this.track = _track;
        await this.processQueue();
    }
    async destroy() {
        if (this.track)
            await this.track.onDestroy();
    }
    addComponentCreator(collector) {
        collector.on('collect', async (interaction) => {
            if (!this.track)
                return;
            try {
                await interaction.deferReply();
                switch (interaction.customId) {
                    case 'stop':
                        collector.stop();
                        this.voiceConnection.destroy();
                        break;
                    case 'next':
                        this.isRepeated = false;
                        this.audioPlayer.stop(true);
                        break;
                    case 'play':
                        this.audioPlayer.unpause();
                        break;
                    case 'repeat':
                        this.isRepeated = true;
                        await this.track.onRepeated(this.isRepeated);
                    case 'pause':
                        this.audioPlayer.pause(true);
                        break;
                    case 'lyrics':
                        this.track.pleaseSendMeTheLyrics(interaction);
                        return;
                }
            }
            catch (err) {
                console.warn(err);
            }
            interaction.deleteReply();
        });
    }
    async processQueue() {
        if (!this.track ||
            this.queueLocked ||
            this.audioPlayer.state.status !== voice_1.AudioPlayerStatus.Idle)
            return;
        this.queueLocked = true;
        try {
            let songIndex = this.track.playlist.songs.findIndex((song) => song.id === this.track?.metadata?.id);
            if (!this.isRepeated) {
                songIndex += 1;
            }
            this.track.metadata = this.track.playlist.songs.at(songIndex);
            if (!this.track.metadata) {
                this.voiceConnection.destroy();
                return;
            }
            const audioResource = await this.track.createProbeAndAudioSource(this.track.metadata.id);
            if (!audioResource)
                return;
            this.audioPlayer.play(audioResource);
            this.queueLocked = false;
        }
        catch (err) {
            this.track.onError(err);
            this.queueLocked = false;
            await this.processQueue();
        }
    }
}
exports.Radio = Radio;
//# sourceMappingURL=radio.js.map