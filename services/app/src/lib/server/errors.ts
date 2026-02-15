import { ERROR_CODE, type ApiError } from "@schale-ledger/contracts";
import {
  ApplicationError,
  AuthenticationRequiredError,
  ConflictError,
  NotFoundError,
  ValidationError
} from "@schale-ledger/application";

export interface ErrorResponseShape {
  status: number;
  body: ApiError;
}

export function normalizeError(error: unknown): ErrorResponseShape {
  if (error instanceof ValidationError) {
    return {
      status: 400,
      body: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    };
  }

  if (error instanceof AuthenticationRequiredError) {
    return {
      status: 401,
      body: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    };
  }

  if (error instanceof NotFoundError) {
    return {
      status: 404,
      body: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    };
  }

  if (error instanceof ConflictError) {
    return {
      status: 409,
      body: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    };
  }

  if (error instanceof ApplicationError) {
    return {
      status: 500,
      body: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    };
  }

  return {
    status: 500,
    body: {
      code: ERROR_CODE.internal,
      message: "システムエラーが発生しました",
      details: {
        reason: error instanceof Error ? error.message : "unknown"
      }
    }
  };
}
