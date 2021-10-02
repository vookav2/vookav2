import { promisify } from 'util'
import glob from 'glob'
import path from 'path'
import configJson from '../config.json'
import { Config } from './Interfaces'

const globPromisify = promisify(glob)
export const commandsPath = path.join(__dirname, 'Commands')
export const eventsPath = path.join(__dirname, 'Events')
export const wait = promisify(setTimeout)

export async function importFiles(
	dir: string,
	callback: (filePath: string) => void
) {
	const filePaths: string[] = await globPromisify(`${dir}/**/*{.ts, .js}`)
	filePaths.forEach(callback)
}
export function paginateArray<T>(
	items: T[],
	options: {
		page: number
		perPage: number
	}
) {
	if (options.page < 1) options.page = 1
	if (options.perPage < 1) options.perPage = 1
	const offset = (options.page - 1) * options.perPage
	return {
		items: items.slice(offset).slice(0, options.perPage),
		offset,
		page: options.page,
		perPage: options.perPage,
		pageTotal: Math.ceil(items.length / options.perPage),
		totalItems: items.length,
	}
}

export const config: Config = configJson
