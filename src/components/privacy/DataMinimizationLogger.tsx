/**
 * Privacy-compliant logging utility for MonArk
 * Implements data minimization principles - never logs PII or sensitive content
 */

interface LogEvent {
  eventType: string;
  userId?: string; // Only user ID, never PII
  timestamp: string;
  metadata?: Record<string, any>; // Non-sensitive metadata only
}

class DataMinimizationLogger {
  private static instance: DataMinimizationLogger;
  private sensitiveFields = [
    'email', 'name', 'bio', 'message', 'content', 'text', 
    'reflection', 'journal', 'password', 'token', 'location_data'
  ];

  static getInstance(): DataMinimizationLogger {
    if (!DataMinimizationLogger.instance) {
      DataMinimizationLogger.instance = new DataMinimizationLogger();
    }
    return DataMinimizationLogger.instance;
  }

  /**
   * Sanitize data to remove any PII before logging
   */
  private sanitizeData(data: any): any {
    if (data === null || data === undefined) return data;
    
    if (typeof data === 'string') {
      // Don't log strings that might contain PII
      return '[REDACTED_STRING]';
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }
    
    if (typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (this.sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object' || Array.isArray(value)) {
          sanitized[key] = this.sanitizeData(value);
        } else if (typeof value === 'string' && value.length > 50) {
          // Long strings might contain PII
          sanitized[key] = '[REDACTED_LONG_STRING]';
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    }
    
    return data;
  }

  /**
   * Log user interaction events (navigation, button clicks, etc.)
   */
  logUserInteraction(eventType: string, userId?: string, metadata?: Record<string, any>) {
    const logEvent: LogEvent = {
      eventType: `user_interaction.${eventType}`,
      userId,
      timestamp: new Date().toISOString(),
      metadata: this.sanitizeData(metadata)
    };
    
    console.log('[MonArk User Interaction]', logEvent);
  }

  /**
   * Log system events (errors, performance, etc.)
   */
  logSystemEvent(eventType: string, metadata?: Record<string, any>) {
    const logEvent: LogEvent = {
      eventType: `system.${eventType}`,
      timestamp: new Date().toISOString(),
      metadata: this.sanitizeData(metadata)
    };
    
    console.log('[MonArk System]', logEvent);
  }

  /**
   * Log RIF events (anonymized emotional intelligence events)
   */
  logRIFEvent(eventType: string, userId?: string, metadata?: Record<string, any>) {
    // Extra sanitization for RIF events since they deal with sensitive emotional data
    const sanitizedMetadata = this.sanitizeData(metadata);
    
    const logEvent: LogEvent = {
      eventType: `rif.${eventType}`,
      userId, // Only user ID for analytics, never emotional content
      timestamp: new Date().toISOString(),
      metadata: sanitizedMetadata
    };
    
    console.log('[MonArk RIF]', logEvent);
  }

  /**
   * Log API calls (without request/response bodies that might contain PII)
   */
  logAPICall(endpoint: string, method: string, statusCode?: number, userId?: string) {
    const logEvent: LogEvent = {
      eventType: 'api_call',
      userId,
      timestamp: new Date().toISOString(),
      metadata: {
        endpoint: endpoint.replace(/\/[a-f0-9-]{36}/g, '/[UUID]'), // Replace UUIDs
        method,
        statusCode
      }
    };
    
    console.log('[MonArk API]', logEvent);
  }

  /**
   * Log errors (without sensitive data)
   */
  logError(error: Error, context?: string, userId?: string) {
    const logEvent: LogEvent = {
      eventType: 'error',
      userId,
      timestamp: new Date().toISOString(),
      metadata: {
        errorType: error.name,
        context,
        // Don't log full error message as it might contain sensitive data
        hasMessage: !!error.message,
        stack: error.stack?.substring(0, 200) // Only first part of stack trace
      }
    };
    
    console.error('[MonArk Error]', logEvent);
  }
}

// Export singleton instance
export const logger = DataMinimizationLogger.getInstance();

// React hook for component-level logging
export const usePrivacyCompliantLogger = (componentName: string) => {
  const logComponentInteraction = (action: string, metadata?: Record<string, any>) => {
    logger.logUserInteraction(`${componentName}.${action}`, undefined, metadata);
  };

  const logComponentError = (error: Error, context?: string) => {
    logger.logError(error, `${componentName}.${context}`);
  };

  return {
    logInteraction: logComponentInteraction,
    logError: logComponentError
  };
};