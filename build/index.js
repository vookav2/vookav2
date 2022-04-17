"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
client_1.VookaClient.init();
//# sourceMappingURL=index.js.map