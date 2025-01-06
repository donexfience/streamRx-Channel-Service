"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
const constants_htt_status_1 = require("./constants-htt-status");
// Custom ValidationError class extending the built-in Error class
class ValidationError extends Error {
    // Constructor accepts validation errors and sets the status code to BAD_REQUEST
    constructor(validationErrors) {
        super("Validation Error");
        Object.setPrototypeOf(this, new.target.prototype);
        this.statusCode = constants_htt_status_1.HttpCode.BAD_REQUEST;
        this.validationErrors = validationErrors;
        // Capture the stack trace for debugging
        Error.captureStackTrace(this);
    }
}
exports.ValidationError = ValidationError;
