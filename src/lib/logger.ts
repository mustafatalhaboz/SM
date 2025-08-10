/**
 * Production-ready logging utility for SuperM
 * Conditionally logs based on environment and provides structured logging
 */

interface LogContext {
  component?: string;
  operation?: string;
  data?: unknown;
  error?: unknown;
  originalError?: string | undefined;
  context?: Record<string, unknown> | undefined;
  count?: number;
  projectId?: string;
  taskId?: string;
  taskTitle?: string;
  projectName?: string;
  selectedDate?: Date;
  isOpen?: boolean;
  title?: string;
  size?: string;
  isLoading?: boolean;
  field?: string;
  type?: string;
  service?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;
    
    if (context) {
      const contextStr = Object.entries(context)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key}:${key === 'error' ? (value as Error).message || value : JSON.stringify(value)}`)
        .join(' ');
      
      return `${prefix} ${message} ${contextStr}`;
    }
    
    return `${prefix} ${message}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('DEBUG', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(this.formatMessage('INFO', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('WARN', message, context));
  }

  error(message: string, context?: LogContext): void {
    console.error(this.formatMessage('ERROR', message, context));
    
    // In production, you might want to send errors to a service like Sentry
    if (!this.isDevelopment && context?.error) {
      // Example: Sentry.captureException(context.error);
    }
  }

  // Firebase-specific logging methods
  firebaseOperation(operation: string, success: boolean, details?: unknown): void {
    const message = `Firebase ${operation} ${success ? 'succeeded' : 'failed'}`;
    
    if (success) {
      this.debug(message, { operation: 'firebase', data: details });
    } else {
      this.error(message, { operation: 'firebase', error: details });
    }
  }

  // Component lifecycle logging
  componentRender(componentName: string, props?: Record<string, unknown>): void {
    this.debug(`${componentName} rendered`, { component: componentName, data: props });
  }

  componentCleanup(componentName: string): void {
    this.debug(`${componentName} cleanup`, { component: componentName });
  }
}

// Export singleton instance
export const logger = new Logger();

// Helper function for backward compatibility
export const logFirebaseOperation = (operation: string, success: boolean, details?: unknown) => {
  logger.firebaseOperation(operation, success, details);
};

// Development-only console replacement (for gradual migration)
export const devLog = {
  log: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(message, ...args);
    }
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(message, ...args);
  }
};