"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const subscriptions_1 = require("../subscriptions");
const strings_1 = require("../strings");
const sources_1 = require("../sources");
const utils_1 = require("../utils");
exports.data = new builders_1.SlashCommandBuilder()
    .setName('radio')
    .setDescription('Start listening a radio.')
    .setDefaultPermission(true)
    .addStringOption(new builders_1.SlashCommandStringOption()
    .setDescription('The URL | title of the song to play.')
    .setRequired(true)
    .setName('query'));
const execute = async function (interaction) {
    if (!(interaction.member instanceof discord_js_1.GuildMember))
        return await interaction.editReply(strings_1.Strings.MEMBER_NOT_IN_GUILD);
    let radioSubscription = this.radioSubscriptions.get(interaction.guildId);
    if (!radioSubscription) {
        try {
            const voiceConnection = await this.voiceManager.createVoiceConnection(interaction.member);
            radioSubscription = new subscriptions_1.Radio(this, voiceConnection);
            this.radioSubscriptions.set(interaction.guildId, radioSubscription);
        }
        catch (err) {
            await interaction.editReply(err.message || err);
            return;
        }
    }
    else if (radioSubscription.track) {
        await interaction.followUp({
            content: strings_1.Strings.GUILD_ALREADY_PLAYING_RADIO,
            ephemeral: true,
        });
        return;
    }
    const query = interaction.options.getString('query', true);
    try {
        const track = await (0, sources_1.createTrack)(this, query, async (playlist) => (await interaction.editReply((0, utils_1.createPlaylistEmbedOptions)(playlist, {
            currentSong: playlist.songs.at(0),
        }))));
        const collector = track.trackMessage?.createMessageComponentCollector({
            filter: (i) => i.message.id === track.trackMessage?.id,
            time: track.playlist.duration || 0,
            componentType: 'BUTTON',
        });
        if (!collector)
            return;
        radioSubscription.addComponentCreator(collector);
        await radioSubscription.start(track);
    }
    catch (err) {
        await interaction.editReply(err.message || err);
        return;
    }
};
exports.execute = execute;
//# sourceMappingURL=radio.js.map