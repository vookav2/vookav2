import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { VookaClient } from '.'
import path from 'path'
import { importFiles } from '../utils'
import { ICommand, IEvent } from '../contracts'

export default class CommandsManager {
	private restApi: REST
	private ctx: VookaClient

	public constructor(_ctx: VookaClient) {
		this.ctx = _ctx

		this.restApi = new REST({ version: '9' }).setToken(this.ctx.config.token)
	}

	public async loadFiles() {
		const commandsPath = path.join(__dirname, '..', 'commands')
		const eventsPath = path.join(__dirname, '..', 'events')

		this.ctx.logger.info('[Commands Manager] Loading commands and events')

		const promises = [
			importFiles(commandsPath, async (filePath: string) => {
				const command: ICommand = await import(filePath)

				this.ctx.commands.set(command.data.name, command)
			}),
			importFiles(eventsPath, async (filePath: string) => {
				const event: IEvent = await import(filePath)
				if (event.name) {
					if (event.once) {
						this.ctx.once(event.name, event.execute.bind(this.ctx))
					} else {
						this.ctx.on(event.name, event.execute.bind(this.ctx))
					}
				}
			}),
		]

		await Promise.allSettled(promises)
		this.ctx.logger.success(
			'[Commands Manager] Successfully loaded commands and events'
		)
	}

	public async updateGuildCommands(guildId: string) {
		this.ctx.logger.info(
			`[Commands Manager] Updating guild commands for guild <${guildId}>`
		)
		try {
			const commands = this.getJSONCommands()
			await this.restApi.put(
				Routes.applicationGuildCommands(this.ctx.config.clientId, guildId),
				{ body: commands }
			)
			this.ctx.logger.success(
				`[Commands Manager] Successfully updated guild commands for guild <${guildId}>`
			)
		} catch (err) {
			this.ctx.logger.error(
				'[Commands Manager] Error updating guild commands',
				err
			)
		}
	}

	public async updateGlobalCommands() {
		this.ctx.logger.info(`[Commands Manager] Updating global commands`)
		try {
			const commands = this.getJSONCommands()
			await this.restApi.put(
				Routes.applicationCommands(this.ctx.config.clientId),
				{ body: commands }
			)
			this.ctx.logger.success(
				`[Commands Manager] Successfully updated global commands`
			)
		} catch (err) {
			this.ctx.logger.error(
				'[Commands Manager] Error updating global commands',
				err
			)
		}
	}

	private getJSONCommands() {
		return this.ctx.commands.map((command) => command.data.toJSON())
	}
}
