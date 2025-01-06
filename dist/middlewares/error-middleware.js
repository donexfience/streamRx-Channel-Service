"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMiddleware = void 0;
const customError_1 = require("./../_lib/utils/errors/customError");
const mongoose_1 = require("mongoose");
const constants_htt_status_1 = require("../_lib/utils/errors/constants-htt-status");
const Logger_1 = require("./Logger");
class ErrorMiddleware {
}
exports.ErrorMiddleware = ErrorMiddleware;
ErrorMiddleware.handleError = (error, _, res, next) => {
    if (error instanceof customError_1.AppError) {
        const { message, name, stack } = error;
        const statusCode = error.statusCode || constants_htt_status_1.HttpCode.INTERNAL_SERVER_ERROR;
        Logger_1.logger.error(`[AppError]: ${message}`, { stack });
        res.status(statusCode).json({
            name: name || "AppError",
            message,
            stack: process.env.NODE_ENV === "development" ? stack : undefined,
        });
    }
    else if (error instanceof mongoose_1.MongooseError) {
        // Handle MongoDB-related errors
        const message = `MongoDB Error: ${error.message}`;
        const statusCode = constants_htt_status_1.HttpCode.INTERNAL_SERVER_ERROR;
        Logger_1.logger.error(`[MongoError]: ${message}`, { error });
        res.status(statusCode).json({
            name: "MongoError",
            message: process.env.NODE_ENV === "development" ? message : "Database Error",
            stack: process.env.NODE_ENV === "development"
                ? error.stack
                : undefined,
        });
    }
    else if (error instanceof Error && error.name === "ValidationError") {
        // Handle Mongoose validation errors if using Mongoose
        const message = `Mongoose Validation Error: ${error.message}`;
        const statusCode = constants_htt_status_1.HttpCode.BAD_REQUEST;
        Logger_1.logger.error(`[ValidationError]: ${message}`, { error });
        res.status(statusCode).json({
            name: "ValidationError",
            message: process.env.NODE_ENV === "development" ? message : "Invalid Data",
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        });
    }
    else {
        const name = "InternalServerError";
        const message = "An internal server error occurred";
        const statusCode = constants_htt_status_1.HttpCode.INTERNAL_SERVER_ERROR;
        Logger_1.logger.error(`[UnknownError]: ${message}`, { error });
        res.status(statusCode).json({
            name,
            message,
            stack: process.env.NODE_ENV === "development"
                ? error.stack
                : undefined,
        });
    }
};
