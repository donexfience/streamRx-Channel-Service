import { AppError } from './../_lib/utils/errors/customError';
import { NextFunction, Request, Response } from "express";
import { MongooseError } from "mongoose";
import { HttpCode } from '../_lib/utils/errors/constants-htt-status';
import { logger } from './Logger';

export class ErrorMiddleware {
  public static handleError = (
    error: unknown,
    _: Request,
    res: Response,
    next: NextFunction
  ): void => {
    if (error instanceof AppError) {
      const { message, name, stack } = error;
      const statusCode = error.statusCode || HttpCode.INTERNAL_SERVER_ERROR;
      logger.error(`[AppError]: ${message}`, { stack });
      res.status(statusCode).json({
        name: name || "AppError",
        message,
        stack: process.env.NODE_ENV === "development" ? stack : undefined,
      });
    } else if (error instanceof MongooseError) {
      // Handle MongoDB-related errors
      const message = `MongoDB Error: ${error.message}`;
      const statusCode = HttpCode.INTERNAL_SERVER_ERROR;
      logger.error(`[MongoError]: ${message}`, { error });

      res.status(statusCode).json({
        name: "MongoError",
        message:
          process.env.NODE_ENV === "development" ? message : "Database Error",
        stack:
          process.env.NODE_ENV === "development"
            ? (error as Error).stack
            : undefined,
      });
    } else if (error instanceof Error && error.name === "ValidationError") {
      // Handle Mongoose validation errors if using Mongoose
      const message = `Mongoose Validation Error: ${error.message}`;
      const statusCode = HttpCode.BAD_REQUEST;
      logger.error(`[ValidationError]: ${message}`, { error });

      res.status(statusCode).json({
        name: "ValidationError",
        message:
          process.env.NODE_ENV === "development" ? message : "Invalid Data",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    } else {
      const name = "InternalServerError";
      const message = "An internal server error occurred";
      const statusCode = HttpCode.INTERNAL_SERVER_ERROR;
      logger.error(`[UnknownError]: ${message}`, { error });
      res.status(statusCode).json({
        name,
        message,
        stack:
          process.env.NODE_ENV === "development"
            ? (error as Error).stack
            : undefined,
      });
    }
  };
}