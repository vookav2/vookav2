import { userMention } from '@discordjs/builders'
import {
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	MessageOptions,
} from 'discord.js'
import { Playlist, Song } from 'voosic'
import { PlaylistEmbedOptions } from '../Interfaces/Music'
import { paginateArray } from '../util'

export function createSongEmbed(song: Song): MessageEmbed {
	let thumbnail
	if (song.artists.filter((x) => x.thumbnails)) {
		thumbnail = song.artists.find((x) => x.thumbnails)?.thumbnail as string
	}
	if (!thumbnail) {
		thumbnail = song?.album?.thumbnail
	}
	if (!thumbnail) {
		thumbnail = song.thumbnail
	}
	const image =
		song.source === 'youtube'
			? `https://img.youtube.com/vi/${song.id}/hqdefault.jpg`
			: thumbnail
	const embed = new MessageEmbed()
		.setTitle(`${song.title} - ${song.artistName}`)
		.setThumbnail(thumbnail)
		.setDescription(
			`Delivered by **Vooka V2 🧃**. Fexible search and easy music bot created by ${userMention(
				'464985649460674572'
			)}.`
		)
		.setImage(image)
		.setURL(song.url)
		.setColor(0x9f9f9f)
		.addField('Source', song.source.toUpperCase(), true)
		.addField('Explicit', song.explicit ? 'Yes' : 'No', true)
	if (song.artists?.length) {
		embed.addField('Artist', song.artists?.at(0)?.title as string, true)
	}
	if (song.album) {
		embed.addField('Album', song.album.title, true)
	}
	return embed
}
export function createPlaylistEmbedOptions(
	playlist: Playlist,
	options?: PlaylistEmbedOptions
): MessageOptions {
	options = {
		status: 'loading',
		page: 1,
		perPage: 5,
		...options,
	}
	const currentSongIndex = playlist.songs.findIndex((p) => p.id === options?.currentSong?.id)
	options.page = Math.ceil((currentSongIndex+1) / (options.perPage as number))

	const iconStatus = {
		loading: '[🔄]',
		paused: '[⏸]',
		playing: '[▶️]',
	}

	const contents = ['`Queue(s) List ◽️◽️◽️◽️◽️◽️`\n']
	const paginate = paginateArray(playlist.songs, {
		page: options.page as number, 
		perPage: options.perPage as number
	})
	const songs = paginate.items

	songs.forEach((song, i) => {
		if (options?.currentSong?.id === song.id) {
			contents.push(
				`\`${iconStatus[options.status || 'loading']}\` \`${song.title} - ${
					song.artistName
				}\` \`[${song.durationFormatted}]\``
			)
		} else {
			contents.push(
				`\`[${i + paginate.offset + 1}]\` \`${song.title} - ${
					song.artistName
				}\` \`[${song.durationFormatted}]\``
			)
		}
	})
	contents.push(
		`\n\`page: ${paginate.page} of ${paginate.pageTotal}\` \`Total: ${paginate.totalItems} song(s)\` \`[${playlist.durationFormatted}]\``
	)
	let embeds = []
	let components = []
	if (options.currentSong) {
		contents.push('**Current _song_:**')
		embeds.push(createSongEmbed((options.currentSong || songs.at(0)) as Song))
		components.push(
			new MessageActionRow().addComponents(createPlaylistButtons(options))
		)
	}
	const result: MessageOptions = {
		content: contents.join('\n'),
		embeds: embeds,
		components: components,
	}
	return result
}
export function createPlaylistButtons(
	options?: PlaylistEmbedOptions
): MessageButton[] {
	let disable = true
	let playOrPauseButton = new MessageButton()
		.setLabel('Play')
		.setCustomId('play')
		.setStyle(1)
	if (options?.currentSong && options.status === 'playing') {
		playOrPauseButton = new MessageButton()
			.setLabel('Pause')
			.setCustomId('pause')
			.setStyle(1)
	}
	if (options?.status !== 'loading') {
		disable = false
	}
	return [
		playOrPauseButton.setDisabled(disable),
		new MessageButton()
			.setLabel('Next')
			.setCustomId('next')
			.setStyle(1)
			.setDisabled(disable),
		new MessageButton()
			.setLabel('Lyrics')
			.setCustomId('lyrics')
			.setStyle(1)
			.setDisabled(true),
		new MessageButton()
			.setLabel('Stop')
			.setCustomId('stop')
			.setStyle(4)
			.setDisabled(disable),
	]
}
