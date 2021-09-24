import Bot from './Client'

const bot = new Bot()
bot.init()

// https://discord.com/api/oauth2/authorize?client_id=858110664018755644&permissions=2251648320&scope=bot%20applications.commands

// import {raw} from 'youtube-dl-exec'
// import fs from 'fs'

// const subprocess = raw('https://www.youtube.com/watch?v=rVeMiVU77wo', { dumpSingleJson: true })

// console.log(`Running subprocess as ${subprocess.pid}`)

// subprocess.stdout?.pipe(fs.createWriteStream('stdout.json'))
// subprocess.stderr?.pipe(fs.createWriteStream('stderr.json'))

// setTimeout(subprocess.cancel, 30000)