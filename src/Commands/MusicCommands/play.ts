import {
	SlashCommandBuilder,
	SlashCommandStringOption,
} from '@discordjs/builders'
import { CommandInteraction, GuildMember, Message } from 'discord.js'
import { VookaClient } from '../../Client'
import MusicSubscribtion from '../../Music'
import { Track } from '../../Music/Track'
import { createPlaylistEmbedOptions } from '../../Helpers/EmbedBuilder'
import { Strings } from '../../Strings'

export const data = new SlashCommandBuilder()
	.setName('play')
	.setDescription('Play a song.')
	.setDefaultPermission(true)
	.addStringOption(
		new SlashCommandStringOption()
			.setDescription('The URL | title of the song to play.')
			.setRequired(true)
			.setName('query')
	)
export const execute = async (
	client: VookaClient,
	message: Message | CommandInteraction
): Promise<void> => {
	if (message instanceof CommandInteraction) {
		try {
			const query = message.options.getString('query', true)
			if (!message.guildId) return
			const channel = client.channels.cache.get(message.channelId)

			let subscribtion = client.subscribtions.get(message.guildId)
			if (!(message.member instanceof GuildMember)) return

			if (!subscribtion) {
				const voiceConnection =
					await client.voiceManager.createVoiceChannelConnection(message.member)
				subscribtion = new MusicSubscribtion(client, voiceConnection)
				client.subscribtions.set(message.guildId, subscribtion)
			} else {
				if (subscribtion.track) {
					await message.followUp({
						content: Strings.GUILD_ALREADY_PLAYING,
						ephemeral: true,
					})
					return
				}
			}

			const track = await Track.from(query)
			message
				.editReply(
					createPlaylistEmbedOptions(track.playlist, {
						currentSong: track.playlist.songs.at(0),
					})
				)
				.then((message) => {
					const collector = (
						message as Message
					).createMessageComponentCollector({
						filter: (i) => i.message.id === message.id,
						time: track.playlist.duration,
						componentType: 'BUTTON',
					})
					subscribtion?.addComponentCollector(collector)
					track.message = message as Message
					subscribtion?.start(track)
				})
				.catch(() => {
					throw new Error('Cannot play the song!. Please try again later.')
				})
			return
		} catch (err) {
			client.logger.warn(err)
			message.editReply((err as Error).message)
			return
		}
	}
}
