import { ERROR_CODE, type ErrorCode } from "@schale-ledger/contracts";

export abstract class ApplicationError extends Error {
  readonly code: ErrorCode;
  readonly details?: unknown;

  protected constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = this.constructor.name;
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, details?: unknown) {
    super(ERROR_CODE.validation, message, details);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string, details?: unknown) {
    super(ERROR_CODE.notFound, message, details);
  }
}

export class PermissionError extends ApplicationError {
  constructor(message: string, details?: unknown) {
    super(ERROR_CODE.permission, message, details);
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string, details?: unknown) {
    super(ERROR_CODE.conflict, message, details);
  }
}

export class InternalError extends ApplicationError {
  constructor(message: string, details?: unknown) {
    super(ERROR_CODE.internal, message, details);
  }
}

export class AuthenticationRequiredError extends ApplicationError {
  constructor(message: string, details?: unknown) {
    super(ERROR_CODE.authenticationRequired, message, details);
  }
}
