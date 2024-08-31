import { Request, Response, NextFunction } from 'express';

/**
 * Represents an API error.
 *
 * @remarks
 * This class extends the built-in Error class and provides additional properties for handling API errors.
 */
class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;

    // Maintains proper stack trace for where our error was thrown (only available on V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * This is the error handler middleware it handles all the errors, If NODE_ENV is dev then it will send the stack trace
 * @param err error object
 * @param req Express.Request
 * @param res Express.Response
 * @param next Express.NextFunction
 */
const ErrorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errStatus: number = err.statusCode || 500;
  const errMsg: string = err.message || 'Something went wrong';
  res.status(errStatus).json({
    success: false,
    status: errStatus,
    message: errMsg,
    stack: process.env.NODE_ENV === 'dev' ? err.stack : {},
  });
};

/**
 * Logs the error message to the console.
 *
 * @param error - The error object or message.
 */
const logError = (error: any): void => {
  console.error(
    `Error reducing image quality: ${
      error instanceof Error ? error.message : error
    }`
  );
};

export { ErrorHandler, ApiError, logError };
