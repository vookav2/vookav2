import { Client, Collection, Intents, Snowflake } from 'discord.js'
import consola, { Consola } from 'consola'
import { ICommand, IConfig, IEvent } from '../contracts'
import { Radio } from '../subscriptions'
import CommandsManager from './commandsManager'
import VoiceManager from './voiceManager'

process.on('warning', console.warn)

export class VookaClient extends Client {
	public logger: Consola
	public config: IConfig | undefined
	public commandsManager: CommandsManager | undefined
	public voiceManager: VoiceManager | undefined

	public commands: Collection<string, ICommand> = new Collection()
	public events: Collection<string, IEvent> = new Collection()
	public radioSubscriptions: Collection<Snowflake, Radio> = new Collection()
	// public musicSubscriptions: Collection<Snowflake, string> = new Collection()

	public clientId: string | undefined

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

		this.logger = consola
		this.logger.success('[Vooka Client] Client created')
	}

	public static async init() {
		const client = new VookaClient()
		client.logger.info('[Vooka Client] Initializing...')

		client.config = {
			token: process.env.O785HG7G || process.env.DISCORD_TOKEN,
			clientId: process.env.OA9458BY || process.env.DISCORD_CLIENT_ID,
		}
		client.commandsManager = new CommandsManager(client)
		client.voiceManager = new VoiceManager(client)
		client.clientId = client.config?.clientId

		await client.commandsManager.loadFiles()

		if (process.env.NODE_ENV !== 'production') {
			const debugGuildId = '858109453512867891'
			client.commandsManager.updateGuildCommands(debugGuildId)
		} else {
			client.commandsManager.updateGlobalCommands()
		}

		try {
			await client.connect()
		} catch (err) {
			client.logger.error('[Vooka Client] Error connecting to Discord:', err)
		}
	}

	public async connect() {
		this.logger.info('[Vooka Client] Connecting...')

		return this.login(this.config?.token)
	}
}
