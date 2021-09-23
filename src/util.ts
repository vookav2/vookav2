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

export const config: Config = configJson
