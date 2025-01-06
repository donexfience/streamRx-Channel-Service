import { HttpCode } from "./constants-htt-status";

export interface AppErrorArgs {
  name?: string;
  statusCode: HttpCode;
  message: string;
  isOperational?: boolean;
}

export class AppError extends Error {
  public readonly name: string;
  public readonly statusCode: HttpCode;
  public readonly isOperational: boolean;

  public constructor({
    message,
    statusCode,
    name,
    isOperational = true,
  }: AppErrorArgs) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name ?? "Error";
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this);
  }

  static badRequest(message: string): AppError {
    return new AppError({ message, statusCode: HttpCode.BAD_REQUEST });
  }

  static unauthorized(message: string): AppError {
    return new AppError({ message, statusCode: HttpCode.UNAUTHORIZED });
  }

  static forbidden(message: string): AppError {
    return new AppError({ message, statusCode: HttpCode.FORBIDDEN });
  }

  static notFound(message: string): AppError {
    return new AppError({ message, statusCode: HttpCode.NOT_FOUND });
  }

  static internalServer(message: string): AppError {
    return new AppError({
      message,
      statusCode: HttpCode.INTERNAL_SERVER_ERROR,
    });
  }
}