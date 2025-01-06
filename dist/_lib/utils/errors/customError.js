"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
const constants_htt_status_1 = require("./constants-htt-status");
class AppError extends Error {
    constructor({ message, statusCode, name, isOperational = true, }) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = name !== null && name !== void 0 ? name : "Error";
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this);
    }
    static badRequest(message) {
        return new AppError({ message, statusCode: constants_htt_status_1.HttpCode.BAD_REQUEST });
    }
    static unauthorized(message) {
        return new AppError({ message, statusCode: constants_htt_status_1.HttpCode.UNAUTHORIZED });
    }
    static forbidden(message) {
        return new AppError({ message, statusCode: constants_htt_status_1.HttpCode.FORBIDDEN });
    }
    static notFound(message) {
        return new AppError({ message, statusCode: constants_htt_status_1.HttpCode.NOT_FOUND });
    }
    static internalServer(message) {
        return new AppError({
            message,
            statusCode: constants_htt_status_1.HttpCode.INTERNAL_SERVER_ERROR,
        });
    }
}
exports.AppError = AppError;
