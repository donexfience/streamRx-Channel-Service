import { HttpCode } from "./constants-htt-status";  

export interface ValidationType {
  fields: string[];
  constants: string;
}

// Custom ValidationError class extending the built-in Error class
export class ValidationError extends Error {
  public readonly statusCode: HttpCode;
  public readonly validationErrors: ValidationType[];
  // Constructor accepts validation errors and sets the status code to BAD_REQUEST
  constructor(validationErrors: ValidationType[]) {
    super("Validation Error");
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = HttpCode.BAD_REQUEST;  
    this.validationErrors = validationErrors;
    
    // Capture the stack trace for debugging
    Error.captureStackTrace(this);
  }
}