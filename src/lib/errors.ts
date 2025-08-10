/**
 * Error handling utilities for SuperM
 * Provides standardized error handling and user-friendly messages
 */

import { logger } from './logger';

// Standard error types
export enum ErrorType {
  FIREBASE_ERROR = 'firebase_error',
  VALIDATION_ERROR = 'validation_error',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error'
}

// Error classification patterns
const ERROR_PATTERNS = {
  FIREBASE: /firebase|firestore/i,
  NETWORK: /network|fetch|connection/i,
  PERMISSION: /permission|unauthorized|forbidden/i,
  VALIDATION: /validation|invalid|required/i
};

// User-friendly error messages
const USER_MESSAGES = {
  [ErrorType.FIREBASE_ERROR]: 'Veritabanı bağlantısında sorun oluştu. Lütfen tekrar deneyin.',
  [ErrorType.VALIDATION_ERROR]: 'Girdiğiniz bilgilerde hata var. Lütfen kontrol edin.',
  [ErrorType.NETWORK_ERROR]: 'İnternet bağlantısı sorunu. Lütfen bağlantınızı kontrol edin.',
  [ErrorType.UNKNOWN_ERROR]: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'
};

/**
 * Standardized error class for SuperM
 */
export class SuperMError extends Error {
  public readonly type: ErrorType;
  public readonly userMessage: string;
  public readonly originalError?: Error | undefined;
  public readonly context?: Record<string, unknown> | undefined;

  constructor(
    type: ErrorType,
    message: string,
    originalError?: Error | undefined,
    context?: Record<string, unknown> | undefined
  ) {
    super(message);
    this.name = 'SuperMError';
    this.type = type;
    this.userMessage = USER_MESSAGES[type];
    this.originalError = originalError;
    this.context = context;

    // Log the error immediately
    logger.error(`SuperM Error: ${type}`, {
      error: this,
      originalError: originalError?.message,
      context
    });
  }
}

/**
 * Classify error type based on error message and properties
 */
export function classifyError(error: unknown): ErrorType {
  if (!error) return ErrorType.UNKNOWN_ERROR;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  if (ERROR_PATTERNS.FIREBASE.test(errorMessage)) {
    return ErrorType.FIREBASE_ERROR;
  }
  
  if (ERROR_PATTERNS.NETWORK.test(errorMessage)) {
    return ErrorType.NETWORK_ERROR;
  }
  
  if (ERROR_PATTERNS.VALIDATION.test(errorMessage)) {
    return ErrorType.VALIDATION_ERROR;
  }
  
  return ErrorType.UNKNOWN_ERROR;
}

/**
 * Handle errors in a standardized way
 * @param error - The error to handle
 * @param context - Additional context information
 * @param showAlert - Whether to show an alert to the user
 * @returns SuperMError instance
 */
export function handleError(
  error: unknown,
  context?: Record<string, unknown>,
  showAlert = false
): SuperMError {
  const errorType = classifyError(error);
  const originalError = error instanceof Error ? error : new Error(String(error));
  
  const superMError = new SuperMError(
    errorType,
    originalError.message,
    originalError,
    context
  );
  
  if (showAlert) {
    alert(superMError.userMessage);
  }
  
  return superMError;
}

/**
 * Firebase-specific error handler
 */
export function handleFirebaseError(
  error: unknown,
  operation: string,
  showAlert = true
): SuperMError {
  return handleError(
    error,
    { operation, service: 'firebase' },
    showAlert
  );
}

/**
 * Validation error handler
 */
export function handleValidationError(
  message: string,
  field?: string,
  showAlert = true
): SuperMError {
  const superMError = new SuperMError(
    ErrorType.VALIDATION_ERROR,
    message,
    undefined,
    { field, type: 'validation' }
  );
  
  if (showAlert) {
    alert(superMError.userMessage);
  }
  
  return superMError;
}

/**
 * Async operation wrapper with error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw handleError(error, context);
  }
}

/**
 * Get user-friendly error message for display
 */
export function getUserErrorMessage(error: unknown): string {
  if (error instanceof SuperMError) {
    return error.userMessage;
  }
  
  const errorType = classifyError(error);
  return USER_MESSAGES[errorType];
}