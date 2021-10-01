import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { VookaClient } from '.'
import { Command, CommandManagerOptions, Event } from '../Interfaces'
import { commandsPath, eventsPath, importFiles } from '../util'

export class CommandManager {
	private client: VookaClient
	private options: CommandManagerOptions | undefined
	private restApi: REST = new REST({ version: '9' })

	constructor(client: VookaClient, options?: CommandManagerOptions) {
		this.client = client
		if (options) this.options = options
		this.restApi.setToken(this.options?.discord?.token as string)
	}
	// public async updateApplicationCommands() {
	// 	await this.deleteApplicationCommands()
	// 	this.client.logger.info(`Discord: Updating application commands`)
	// 	const res = await this.restApi.put(
	// 		Routes.applicationCommands(
	// 			this.options?.discord?.clientId as string
	// 		),
	// 		{
	// 			body: this.getCommandsJSON()
	// 		}
	// 	)
	// 	this.client.logger.success(`Discord: Successfully update application commands`)
	// 	return
	// }
	public getCommandsJSON(): Object[] {
		return this.client.commands.map((command) => command.data.toJSON())
	}
	// public async deleteApplicationCommands(): Promise<void> {
	// 	const commands = await this.getApplicationCommands()
	// 	this.client.logger.info(`Discord: Start deleting application commands`)
	// 	if (commands && Array.isArray(commands)) {
	// 		await Promise.allSettled(
	// 			commands.map(async (x: any) => {
	// 				return this.restApi.delete(
	// 					Routes.applicationCommand(
	// 						this.options?.discord?.clientId as string,
	// 						x.id
	// 					)
	// 				)
	// 			})
	// 		)
	// 	}
	// 	this.client.logger.success(
	// 		`Discord: Successfully delete application commands`
	// 	)
	// 	return
	// }
	// public async getApplicationCommands() {
	// 	return this.restApi.get(
	// 		Routes.applicationCommands(this.options?.discord?.clientId as string)
	// 	)
	// }

	
	public async updateGuildCommands(guildId: string) {
		// await this.deleteGuildCommands(guildId)
		try {
			this.client.logger.info(`Discord: Updating guild commands`)
			await this.restApi.put(
				Routes.applicationGuildCommands(
					this.options?.discord?.clientId as string,
					guildId
				),
				{
					body: this.getCommandsJSON(),
				}
			)
			this.client.logger.success(`Discord: Successfully update guild commands`)
			return
		} catch (error) {}
	}
	public async updateGuildsCommands(){
		try {
			const guilds = await this.client.guilds.fetch()
			this.client.logger.info(`Discord: Start update ${guilds.size} guild(s) commands.`)
			await Promise.allSettled(guilds.mapValues(async (v) => {
				this.client.logger.info(`Discord: [${v.name}] Updating guild commands.`)
				await this.updateGuildCommands(v.id)
			}))
		} catch (error) {}
	}
	public async deleteGuildCommands(guildId: string): Promise<void> {
		const guildCommands = await this.getGuildCommands(guildId)
		this.client.logger.info('Discord: Start deleting guild commands....')
		if (guildCommands && Array.isArray(guildCommands)) {
			await Promise.allSettled(
				guildCommands.map(async (x: any) => {
					return this.restApi.delete(
						Routes.applicationGuildCommand(
							this.options?.discord?.clientId as string,
							guildId,
							x.id
						)
					)
				})
			)
		}
		this.client.logger.success('Discord: Successfully delete guild commands')
	}
	public async getGuildCommands(guildId: string) {
		return this.restApi.get(
			Routes.applicationGuildCommands(
				this.options?.discord?.clientId as string,
				guildId
			)
		)
	}
	public loadCommandsAndEvents() {
		const promises = [
			importFiles(commandsPath, async (filePath: string) => {
				const command: Command = await import(filePath)
				this.client.commands.set(command.data.name, command)
				if (command.aliases?.length) {
					command.aliases.forEach((alias) => {
						this.client.aliases.set(alias, command)
					})
				}
				this.client.logger.success(
					`Discord: Successfully loaded [${command.data.name}] command.`
				)
			}),
			importFiles(eventsPath, async (filePath: string) => {
				const event: Event = await import(filePath)
				if (event.name) {
					this.client.events.set(event.name, event)
					if (event.once) {
						this.client.once(event.name, event.execute.bind(null, this.client))
					} else {
						this.client.on(event.name, event.execute.bind(null, this.client))
					}
					this.client.logger.success(
						`Discord: Successfully loaded [${event.name}] event.`
					)
				}
			}),
		]
		return Promise.allSettled(promises)
	}
	public async refreshCommands(): Promise<void> {
		this.client.logger.info(`Discord: Refreshing slash commands`)
			// await this.updateApplicationCommands()
		await this.updateGuildsCommands()
		// this.client.logger.success(`Discord: Successfully refresh slash (/) commands`)
	}
}
