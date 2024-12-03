/**
 * Represents an application-specific error with an associated HTTP status code.
 *
 * @extends {Error}
 */
export class AppError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = (status: number, message: string) => {
  return new AppError(status, message);
};
