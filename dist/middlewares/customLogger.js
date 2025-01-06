"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    error(message) {
        console.error(`[ERROR]:${message}`);
    }
    info(message) {
        console.log(`[INFRO] ${message}`);
    }
}
exports.Logger = Logger;
