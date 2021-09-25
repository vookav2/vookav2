import {
	SlashCommandBuilder,
	SlashCommandStringOption,
} from '@discordjs/builders'
import {
	entersState,
	joinVoiceChannel,
	VoiceConnection,
	VoiceConnectionStatus,
} from '@discordjs/voice'
import {
	CommandInteraction,
	GuildMember,
	InternalDiscordGatewayAdapterCreator,
	Message,
} from 'discord.js'
import VookaClient from '../../Client'
import MusicSubscribtion from '../../Music'
import { Track } from '../../Music/Track'

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
		const query = message.options.getString('query', true)
		let subscribtion = client.subscribtions.get(message.guildId as string)
		if (!subscribtion) {
			if (
				message.member instanceof GuildMember &&
				message.member.voice.channel
			) {
				const channel = message.member.voice.channel
				subscribtion = new MusicSubscribtion(
					joinVoiceChannel({
						channelId: channel.id,
						guildId: channel.guild.id,
						adapterCreator: channel.guild.voiceAdapterCreator,
					})
				)
				subscribtion.voiceConnection.on('error', client.logger.warn)
				client.subscribtions.set(channel.guild.id, subscribtion)
			} else {
				await message.editReply('Join a voice channel and then try that again!')
				return
			}
		}
		try {
			await entersState(
				subscribtion.voiceConnection,
				VoiceConnectionStatus.Ready,
				20e3
			)
		} catch (err) {
			client.logger.error(err)
			await message.editReply(
				'Failed to join the voice channel within 20 seconds, please try again later!'
			)
			return
		}
		try {
			// Attempt to create a Track from the user's video URL
			const track = await Track.from(query, {
				onStart() {
					message
						.followUp({ content: 'Now playing!', ephemeral: true })
						.catch(client.logger.warn)
				},
				onFinish() {
					message
						.followUp({ content: 'Now finished!', ephemeral: true })
						.catch(client.logger.warn)
				},
				onError(err) {
					client.logger.warn(err)
					message
						.followUp({ content: `Error: ${err.message}`, ephemeral: true })
						.catch(client.logger.warn)
				},
			})
			if (!track) {
				message
					.followUp({
						content: `Error: Unfortunately, we are under constructing right now. Please wait for next upgrade.`,
						ephemeral: true,
					})
					.catch(client.logger.warn)
				return
			}
			subscribtion.enqueue(track)
			let hasMoreSongs = ''
			if (track.nextSongs?.length){
				hasMoreSongs = ` and ${track.nextSongs.length} mores`
			}
			await message.followUp({content: `Enqueued **${track.song?.fullTitle}**${hasMoreSongs}`, ephemeral: false})
		} catch (err) {
			client.logger.error(err)
			await message.reply('Failed to play track, please try again later!')
		}
	}
}
