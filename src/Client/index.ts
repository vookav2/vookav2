import { Client, Collection, Guild, Intents, Snowflake } from 'discord.js'
import { Command, Config, Event } from '../Interfaces'
import consola, { Consola, ConsolaLogObject, logType } from 'consola'
import { commandsPath, config, eventsPath, importFiles } from '../util'
import { Routes } from 'discord-api-types/v9'
import { REST } from '@discordjs/rest'
import MusicSubscribtion from '../Music'

class ExtendedDiscordClient extends Client {
	public logger: Consola = consola
	public commands: Collection<string, Command> = new Collection()
	public events: Collection<string, Event> = new Collection()
	public aliases: Collection<string, Command> = new Collection()
	public subscribtions: Collection<Snowflake, MusicSubscribtion> =
		new Collection()
	private config: Config = config
	private restApi: REST = new REST({ version: '9' })

	public constructor() {
		super({
			intents: [
				Intents.FLAGS.GUILDS,
				Intents.FLAGS.GUILD_MESSAGES,
				Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
				Intents.FLAGS.GUILD_MESSAGE_TYPING,
				Intents.FLAGS.GUILD_PRESENCES,
				Intents.FLAGS.GUILD_VOICE_STATES,
			],
		})
		this.restApi.setToken(this.config.discord.token)
		this.logger.success('Discord: Client created')
	}

	public init() {
		this.logger.info('Discord: Initializing...')
		const promises: [Promise<void>, Promise<void>, Promise<string>] = [
			importFiles(commandsPath, async (filePath: string) => {
				const command: Command = await import(filePath)
				this.commands.set(command.data.name, command)
				if (command.aliases?.length) {
					command.aliases.forEach((alias) => {
						this.aliases.set(alias, command)
					})
				}
			}),
			importFiles(eventsPath, async (filePath: string) => {
				const event: Event = await import(filePath)
				if (event.name) {
					this.events.set(event.name, event)
					if (event.once) {
						this.once(event.name, event.execute.bind(null, this))
					} else {
						this.on(event.name, event.execute.bind(null, this))
					}
				}
			}),
			this.login(this.config.discord.token),
		]
		return Promise.all(promises)
	}
	public async refreshApplicationCommands(): Promise<void> {
		this.logger.info(`Discord: [${this.user?.tag}] Refreshing slash commands`)
		this.restApi
			.put(Routes.applicationCommands(this.config.discord.clientId), {
				body: this.getCommandsJSON(),
			})
			.then(this.logger.log)
			.catch(this.logger.error)
	}
	public getCommandsJSON(): Object[] {
		return this.commands.map((command) => command.data.toJSON())
	}
}

export default ExtendedDiscordClient
