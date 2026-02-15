export const ERROR_CODE = {
  validation: "validation_error",
  notFound: "not_found",
  permission: "permission_denied",
  conflict: "conflict",
  internal: "internal_error",
  authenticationRequired: "authentication_required"
} as const;

export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: unknown;
}
