"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VookaClient = void 0;
const discord_js_1 = require("discord.js");
const consola_1 = __importDefault(require("consola"));
const commandsManager_1 = __importDefault(require("./commandsManager"));
const voiceManager_1 = __importDefault(require("./voiceManager"));
process.on('warning', console.warn);
class VookaClient extends discord_js_1.Client {
    logger;
    config;
    commandsManager;
    voiceManager;
    commands = new discord_js_1.Collection();
    events = new discord_js_1.Collection();
    radioSubscriptions = new discord_js_1.Collection();
    // public musicSubscriptions: Collection<Snowflake, string> = new Collection()
    clientId;
    constructor() {
        super({
            intents: [
                discord_js_1.Intents.FLAGS.GUILDS,
                discord_js_1.Intents.FLAGS.GUILD_MESSAGES,
                discord_js_1.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                discord_js_1.Intents.FLAGS.GUILD_MESSAGE_TYPING,
                discord_js_1.Intents.FLAGS.GUILD_PRESENCES,
                discord_js_1.Intents.FLAGS.GUILD_VOICE_STATES,
            ],
        });
        this.logger = consola_1.default;
        this.logger.success('[Vooka Client] Client created');
    }
    static async init() {
        const client = new VookaClient();
        client.logger.info('[Vooka Client] Initializing...');
        client.config = {
            token: process.env.O785HG7G || process.env.DISCORD_TOKEN,
            clientId: process.env.OA9458BY || process.env.DISCORD_CLIENT_ID,
        };
        client.commandsManager = new commandsManager_1.default(client);
        client.voiceManager = new voiceManager_1.default(client);
        client.clientId = client.config?.clientId;
        await client.commandsManager.loadFiles();
        if (process.env.NODE_ENV !== 'production') {
            const debugGuildId = '858109453512867891';
            client.commandsManager.updateGuildCommands(debugGuildId);
        }
        else {
            client.commandsManager.updateGlobalCommands();
        }
        try {
            await client.connect();
        }
        catch (err) {
            client.logger.error('[Vooka Client] Error connecting to Discord:', err);
        }
    }
    async connect() {
        this.logger.info('[Vooka Client] Connecting...');
        return this.login(this.config?.token);
    }
}
exports.VookaClient = VookaClient;
//# sourceMappingURL=index.js.map