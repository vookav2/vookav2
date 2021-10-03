import { Client, Collection, Intents, Snowflake } from 'discord.js'
import { Command, Config, Event } from '../Interfaces'
import { config } from '../util'
import { CommandManager, VoiceManager } from '.'
import consola, { Consola } from 'consola'
import MusicSubscribtion from '../Music'
import NodeCache from 'node-cache'

export class VookaClient extends Client {
	public logger: Consola = consola
	public commands: Collection<string, Command> = new Collection()
	public events: Collection<string, Event> = new Collection()
	public aliases: Collection<string, Command> = new Collection()
	public cache: NodeCache
	public subscribtions: Collection<Snowflake, MusicSubscribtion> =
		new Collection()
	public commandManager: CommandManager
	public voiceManager: VoiceManager
	private config: Config = config

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
		this.commandManager = new CommandManager(this, {
			discord: this.config.discord,
		})
		this.voiceManager = new VoiceManager(this)
		this.cache = new NodeCache({stdTTL: 0, checkperiod: 0, useClones: false})
		this.logger.success('Discord: Client created')
	}
	/**
	 * ===========================
	 * Client Initialization
	 * ===========================
	 */
	public init() {
		this.logger.info('Discord: Initializing...')
		return this.commandManager.loadCommandsAndEvents()
	}
	public async connect() {
		this.logger.info('Discord: Connecting...')
		return this.login(this.config.discord.token)
			.then(() => this)
			.catch((err) => {
				this.destroy()
			})
	}
}
