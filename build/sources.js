"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrack = void 0;
const youtube_dl_exec_1 = require("youtube-dl-exec");
const voice_1 = require("@discordjs/voice");
const voosic_1 = require("voosic");
const strings_1 = require("./strings");
const utils_1 = require("./utils");
const songlyrics_1 = __importDefault(require("songlyrics"));
const resolveQueryFromYoutube = async (query) => {
    return await new voosic_1.Youtube().resolve(query);
};
const createTrack = async (ctx, query, message) => {
    const result = await resolveQueryFromYoutube(query);
    if (!result)
        throw new Error(strings_1.Strings.NO_MUSIC_FOUND);
    const playlist = result instanceof voosic_1.Playlist ? result : result.playlist;
    const track = {
        ctx,
        metadata: undefined,
        guildId: null,
        playlist,
        createProbeAndAudioSource: function (ytId) {
            return new Promise((resolve, reject) => {
                const raw = (0, youtube_dl_exec_1.raw)(`https://www.youtube.com/watch?v=${ytId}`, {
                    o: '-',
                    q: '',
                    f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
                    r: '100K',
                }, { stdio: ['ignore', 'pipe', 'ignore'] });
                if (!raw.stdout) {
                    return reject(new Error('[createRawSource] Invalid music information!'));
                }
                const stream = raw.stdout;
                const onStreamError = (err) => {
                    if (!raw.killed)
                        raw.kill();
                    stream.resume();
                    return reject(`[createRawSource] Stream error, skipped!`);
                };
                const onStreamSpawn = async () => {
                    try {
                        const { stream: probeStream, type } = await (0, voice_1.demuxProbe)(stream);
                        return resolve((0, voice_1.createAudioResource)(probeStream, {
                            metadata: this,
                            inputType: type,
                        }));
                    }
                    catch (err) {
                        return onStreamError(err);
                    }
                };
                raw.once('spawn', onStreamSpawn).catch(onStreamError);
            });
        },
        pleaseSendMeTheLyrics: async function (message) {
            if (this.lyricMessages && this.lyricMessages.length) {
                message.deleteReply();
                return;
            }
            if (this.metadata) {
                try {
                    const lyrics = await (0, songlyrics_1.default)(this.metadata.title + ' ' + this.metadata.artistName);
                    const splitLyrics = (0, utils_1.createLyricsContent)(lyrics, this.metadata);
                    this.lyricsMessages = await Promise.all(splitLyrics.map((x) => message.followUp(x)));
                    return;
                }
                catch (err) { }
            }
            if (message.deferred) {
                message.followUp(strings_1.Strings.NO_LYRICS_FOUND);
            }
        },
        onPrepare: async function () {
            this.trackMessage = await message(playlist);
            this.guildId = this.trackMessage?.guildId;
        },
        onPlay: async function () {
            if (this.trackMessage) {
                const embed = (0, utils_1.createPlaylistEmbedOptions)(playlist, {
                    currentSong: this.metadata,
                    status: 'playing',
                });
                this.trackMessage = await this.trackMessage.edit(embed);
            }
        },
        onPause: async function () {
            if (this.trackMessage) {
                const embed = (0, utils_1.createPlaylistEmbedOptions)(playlist, {
                    currentSong: this.metadata,
                    status: 'paused',
                });
                this.trackMessage = await this.trackMessage.edit(embed);
            }
        },
        onFinish: async function () {
            if (this.lyricsMessages && this.lyricsMessages.length) {
                Promise.all(this.lyricsMessages.map((x) => x.delete()))
                    .then(() => {
                    this.lyricsMessages = [];
                })
                    .catch(() => { });
            }
        },
        onDestroy: async function () {
            await this.trackMessage?.delete();
            await this.onFinish();
            this.ctx.radioSubscriptions.delete(this.guildId);
        },
        onError: async function (err) {
            if (this.ctx.logger)
                this.ctx.logger.error(`[createTrack] ${err}`);
            else
                console.error(err);
            await this.onFinish();
        },
    };
    await track.onPrepare();
    return track;
};
exports.createTrack = createTrack;
//# sourceMappingURL=sources.js.map