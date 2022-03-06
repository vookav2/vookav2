"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.name = void 0;
exports.name = 'interactionCreate';
const execute = async function (interaction) {
    if (interaction.isCommand()) {
        if (!interaction.inGuild())
            return;
        const command = this.commands.get(interaction.commandName);
        if (!command)
            return;
        await interaction.deferReply();
        command.execute.bind(this)(interaction);
    }
};
exports.execute = execute;
//# sourceMappingURL=interactionCreate.js.map