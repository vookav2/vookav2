import { Client, Collection, Guild, Intents, Snowflake } from 'discord.js'
import { Command, Config, Event } from '../Interfaces'
import consola, { Consola, ConsolaLogObject, logType } from 'consola'
import { commandsPath, config, eventsPath, importFiles } from '../util'
import { Routes } from 'discord-api-types/v9'
import { REST } from '@discordjs/rest'
import MusicSubscribtion from '../Music'

class VookaClient extends Client {
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
		return this.loadCommandsAndEvents()
	}
	public getCommandsJSON(): Object[] {
		return this.commands.map((command) => command.data.toJSON())
	}	
	public async refreshCommands(): Promise<void> {
		this.logger.info(`Discord: Refreshing slash commands`)
		if (this.config.discord.guildId) {
			await this.updateGuildCommands(this.config.discord.guildId)
		}
	}
	public async connect(){
		this.logger.info('Discord: Connecting...')
		return this.login(this.config.discord.token)
			.then(() => this)
			.catch((err) => {
				this.destroy()
			})
	}
	private async updateGuildCommands(guildId: string){
		const res = await this.restApi
			.put(Routes.applicationGuildCommands(this.config.discord.clientId, guildId), {
				body: this.getCommandsJSON(),
			})
		this.logger.success(`Discord: Successfully update guild commands`)
		return
	}
	private async deleteApplicationCommands(): Promise<void>{
		const commands = await this.getApplicationCommands()
		if (commands && Array.isArray(commands)){
			await Promise.all(commands.map(async (x: any) => {
				return this.restApi.delete(Routes.applicationCommand(this.config.discord.clientId, x.id))
			}))
		}
		this.logger.success(`Discord: Successfully delete application commands`)
		return
	}
	private async getApplicationCommands(){
		return this.restApi.get(Routes.applicationCommands(this.config.discord.clientId))
	}
	private loadCommandsAndEvents(){
		const promises = [
			importFiles(commandsPath, async (filePath: string) => {
				const command: Command = await import(filePath)
				this.commands.set(command.data.name, command)
				if (command.aliases?.length) {
					command.aliases.forEach((alias) => {
						this.aliases.set(alias, command)
					})
				}
				this.logger.log(`Discord: Successfully loaded ${filePath} command file. {Command Name: ${command.data.name}}`)
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
					this.logger.log(`Discord: Successfully loaded ${filePath} event file. {Event Name: ${event.name}}`)
				}
			})
		]
		return Promise.all(promises)
	}
}

export default VookaClient
