"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.once = exports.name = void 0;
exports.name = 'ready';
exports.once = true;
const execute = async function () {
    this.logger.success(`[Vooka Client] [${this.user?.tag}] is ONLINE.`);
};
exports.execute = execute;
//# sourceMappingURL=ready.js.map