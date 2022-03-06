"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rest_1 = require("@discordjs/rest");
const v9_1 = require("discord-api-types/v9");
const path_1 = __importDefault(require("path"));
const utils_1 = require("../utils");
class CommandsManager {
    restApi;
    ctx;
    constructor(_ctx) {
        this.ctx = _ctx;
        this.restApi = new rest_1.REST({ version: '9' }).setToken(this.ctx.config?.token);
    }
    async loadFiles() {
        const commandsPath = path_1.default.join(__dirname, '..', 'commands');
        const eventsPath = path_1.default.join(__dirname, '..', 'events');
        this.ctx.logger.info('[Commands Manager] Loading commands and events');
        const promises = [
            (0, utils_1.importFiles)(commandsPath, async (filePath) => {
                const command = await Promise.resolve().then(() => __importStar(require(filePath)));
                this.ctx.commands.set(command.data.name, command);
            }),
            (0, utils_1.importFiles)(eventsPath, async (filePath) => {
                const event = await Promise.resolve().then(() => __importStar(require(filePath)));
                if (event.name) {
                    if (event.once) {
                        this.ctx.once(event.name, event.execute.bind(this.ctx));
                    }
                    else {
                        this.ctx.on(event.name, event.execute.bind(this.ctx));
                    }
                }
            }),
        ];
        await Promise.allSettled(promises);
        this.ctx.logger.success('[Commands Manager] Successfully loaded commands and events');
    }
    async updateGuildCommands(guildId) {
        this.ctx.logger.info(`[Commands Manager] Updating guild commands for guild <${guildId}>`);
        try {
            const commands = this.getJSONCommands();
            await this.restApi.put(v9_1.Routes.applicationGuildCommands(this.ctx.config?.clientId, guildId), { body: commands });
            this.ctx.logger.success(`[Commands Manager] Successfully updated guild commands for guild <${guildId}>`);
        }
        catch (err) {
            this.ctx.logger.error('[Commands Manager] Error updating guild commands', err);
        }
    }
    async updateGlobalCommands() {
        this.ctx.logger.info(`[Commands Manager] Updating global commands`);
        try {
            const commands = this.getJSONCommands();
            await this.restApi.put(v9_1.Routes.applicationCommands(this.ctx.config?.clientId), { body: commands });
            this.ctx.logger.success(`[Commands Manager] Successfully updated global commands`);
        }
        catch (err) {
            this.ctx.logger.error('[Commands Manager] Error updating global commands', err);
        }
    }
    getJSONCommands() {
        return this.ctx.commands.map((command) => command.data.toJSON());
    }
}
exports.default = CommandsManager;
//# sourceMappingURL=commandsManager.js.map