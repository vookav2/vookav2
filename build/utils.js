"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLyricsContent = exports.createPlaylistButtons = exports.createPlaylistEmbedOptions = exports.createSongEmbed = exports.paginateArray = exports.importFiles = exports.wait = void 0;
const util_1 = require("util");
const glob_1 = __importDefault(require("glob"));
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const globPromisify = (0, util_1.promisify)(glob_1.default);
exports.wait = (0, util_1.promisify)(setTimeout);
async function importFiles(dir, callback) {
    const filePaths = await globPromisify(`${dir}/**/*{.ts,.js}`);
    filePaths.forEach(callback);
}
exports.importFiles = importFiles;
function paginateArray(items, options) {
    if (options.page < 1)
        options.page = 1;
    if (options.perPage < 1)
        options.perPage = 1;
    const offset = (options.page - 1) * options.perPage;
    return {
        items: items.slice(offset).slice(0, options.perPage),
        offset,
        page: options.page,
        perPage: options.perPage,
        pageTotal: Math.ceil(items.length / options.perPage),
        totalItems: items.length,
    };
}
exports.paginateArray = paginateArray;
function createSongEmbed(song) {
    let thumbnail;
    if (song.artists.filter((x) => x.thumbnails)) {
        thumbnail = song.artists.find((x) => x.thumbnails)?.thumbnail;
    }
    if (!thumbnail) {
        thumbnail = song?.album?.thumbnail;
    }
    if (!thumbnail) {
        thumbnail = song.thumbnail;
    }
    const image = song.source === 'youtube'
        ? `https://img.youtube.com/vi/${song.id}/hqdefault.jpg`
        : thumbnail;
    const embed = new discord_js_1.MessageEmbed()
        .setTitle(`${song.title} - ${song.artistName}`)
        .setThumbnail(thumbnail)
        .setDescription(`Delivered by **Vooka V2 🧃**. Fexible search and easy music bot created by ${(0, builders_1.userMention)('464985649460674572')}.`)
        .setImage(image)
        .setURL(song.url)
        .setColor(0x9f9f9f)
        .addField('Source', song.source.toUpperCase(), true)
        .addField('Explicit', song.explicit ? 'Yes' : 'No', true);
    if (song.artists?.length) {
        embed.addField('Artist', song.artists?.at(0)?.title, true);
    }
    if (song.album) {
        embed.addField('Album', song.album.title, true);
    }
    return embed;
}
exports.createSongEmbed = createSongEmbed;
function createPlaylistEmbedOptions(playlist, options) {
    options = {
        status: 'loading',
        page: 1,
        perPage: 5,
        ...options,
    };
    const currentSongIndex = playlist.songs.findIndex((p) => p.id === options?.currentSong?.id);
    options.page = Math.ceil((currentSongIndex + 1) / options.perPage);
    const iconStatus = {
        loading: '[🔄]',
        paused: '[⏸]',
        playing: '[▶️]',
    };
    const contents = ['`Queue(s) List ◽️◽️◽️◽️◽️◽️`\n'];
    const paginate = paginateArray(playlist.songs, {
        page: options.page,
        perPage: options.perPage,
    });
    const songs = paginate.items;
    songs.forEach((song, i) => {
        if (options?.currentSong?.id === song.id) {
            contents.push(`\`${iconStatus[options.status || 'loading']}\` \`${song.title} - ${song.artistName}\` \`[${song.durationFormatted}]\``);
        }
        else {
            contents.push(`\`[${i + paginate.offset + 1}]\` \`${song.title} - ${song.artistName}\` \`[${song.durationFormatted}]\``);
        }
    });
    contents.push(`\n\`page: ${paginate.page} of ${paginate.pageTotal}\` \`Total: ${paginate.totalItems} song(s)\` \`[${playlist.durationFormatted}]\``);
    let embeds = [];
    let components = [];
    if (options.currentSong) {
        contents.push('**Current _song_:**');
        embeds.push(createSongEmbed((options.currentSong || songs.at(0))));
        components.push(new discord_js_1.MessageActionRow().addComponents(createPlaylistButtons(options)));
    }
    const result = {
        content: contents.join('\n'),
        embeds: embeds,
        components: components,
    };
    return result;
}
exports.createPlaylistEmbedOptions = createPlaylistEmbedOptions;
function createPlaylistButtons(options) {
    let disable = true;
    let playOrPauseButton = new discord_js_1.MessageButton()
        .setLabel('Play')
        .setCustomId('play')
        .setStyle(1);
    if (options?.currentSong && options.status === 'playing') {
        playOrPauseButton = new discord_js_1.MessageButton()
            .setLabel('Pause')
            .setCustomId('pause')
            .setStyle(1);
    }
    if (options?.status !== 'loading') {
        disable = false;
    }
    return [
        playOrPauseButton.setDisabled(disable),
        new discord_js_1.MessageButton()
            .setLabel('Next')
            .setCustomId('next')
            .setStyle(1)
            .setDisabled(disable),
        new discord_js_1.MessageButton()
            .setLabel('Lyrics')
            .setCustomId('lyrics')
            .setStyle(1)
            .setDisabled(disable),
        new discord_js_1.MessageButton()
            .setLabel('Stop')
            .setCustomId('stop')
            .setStyle(4)
            .setDisabled(disable),
    ];
}
exports.createPlaylistButtons = createPlaylistButtons;
function createLyricsContent(lyrics, song) {
    const source = (0, builders_1.italic)(`Source: ${lyrics.source.name}`);
    const title = (0, builders_1.bold)(`${song.title} Lyrics`);
    if (lyrics.lyrics.length > 2000) {
        const lyricsSplitted = lyrics.lyrics.split('\n\n');
        const length = Math.ceil(lyricsSplitted.length / 2);
        const lyricsChunk = [
            lyricsSplitted.slice(0, length),
            lyricsSplitted.slice(length),
        ];
        return lyricsChunk.map((x) => {
            return (0, builders_1.blockQuote)(`${title}\n\n${x.join('\n\n').trim()}\n\n${source}`);
        });
    }
    else {
        return [(0, builders_1.blockQuote)(`${title}\n\n${lyrics.lyrics.trim()}\n\n${source}`)];
    }
}
exports.createLyricsContent = createLyricsContent;
//# sourceMappingURL=utils.js.map