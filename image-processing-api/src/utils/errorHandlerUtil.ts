import { Request, Response, NextFunction } from 'express';
import { APIError } from '../constants'

/**
 * This is the error handler middleware it handles all the errors, If NODE_ENV is dev then it will send the stack trace
 * @param err error object
 * @param req Express.Request
 * @param res Express.Response
 * @param next Express.NextFunction
 */
const ErrorHandler = (
  err: APIError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errStatus: number = err.status || 500;
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
    }`,
  );
};

export { ErrorHandler, APIError, logError };
