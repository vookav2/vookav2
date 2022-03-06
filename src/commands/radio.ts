import {
	SlashCommandBuilder,
	SlashCommandStringOption,
} from '@discordjs/builders'
import { VoiceConnection } from '@discordjs/voice'
import { CommandInteraction, GuildMember, Message } from 'discord.js'
import { Radio } from '../subscriptions'
import { Strings } from '../strings'
import { createTrack } from '../sources'
import { Playlist } from 'voosic'
import { createPlaylistEmbedOptions } from '../utils'

export const data = new SlashCommandBuilder()
	.setName('radio')
	.setDescription('Start listening a radio.')
	.setDefaultPermission(true)
	.addStringOption(
		new SlashCommandStringOption()
			.setDescription('The URL | title of the song to play.')
			.setRequired(true)
			.setName('query')
	)
export const execute = async function (interaction: CommandInteraction) {
	if (!(interaction.member instanceof GuildMember))
		return await interaction.editReply(Strings.MEMBER_NOT_IN_GUILD)

	let radioSubscription: Radio | undefined = this.radioSubscriptions.get(
		interaction.guildId
	)

	if (!radioSubscription) {
		try {
			const voiceConnection: VoiceConnection =
				await this.voiceManager.createVoiceConnection(interaction.member)
			radioSubscription = new Radio(this, voiceConnection)

			this.radioSubscriptions.set(interaction.guildId, radioSubscription)
		} catch (err) {
			await interaction.editReply(err.message || err)
			return
		}
	} else {
		await interaction.followUp({
			content: Strings.GUILD_ALREADY_PLAYING_RADIO,
			ephemeral: true,
		})
		return
	}

	const query = interaction.options.getString('query', true)

	try {
		const track = await createTrack(
			this,
			query,
			async (playlist: Playlist) =>
				(await interaction.editReply(
					createPlaylistEmbedOptions(playlist, {
						currentSong: playlist.songs.at(0),
					})
				)) as Message
		)
		const collector = track.trackMessage.createMessageComponentCollector({
			filter: (i) => i.message.id === track.trackMessage.id,
			time: track.playlist.duration || 0,
			componentType: 'BUTTON',
		})
		radioSubscription.addComponentCreator(collector)
		await radioSubscription.start(track)
	} catch (err) {
		await interaction.editReply(err.message || err)
		return
	}
}
