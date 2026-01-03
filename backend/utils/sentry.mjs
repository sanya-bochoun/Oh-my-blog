import * as Sentry from '@sentry/node';

/**
 * Initialize Sentry for error tracking and monitoring
 * This should be called before any other imports that might cause errors
 */
export const initSentry = () => {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV || 'development';

  // Only initialize Sentry if DSN is provided
  if (!dsn) {
    console.log('Sentry DSN not provided, error tracking disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev
    
    // Profiling (optional, can be enabled if @sentry/profiling-node is properly configured)
    // profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Release tracking (optional)
    release: process.env.SENTRY_RELEASE || undefined,
    
    // Filter out sensitive data
    beforeSend(event, hint) {
      // Don't send events in development unless explicitly enabled
      if (environment === 'development' && process.env.SENTRY_ENABLE_DEV !== 'true') {
        return null;
      }

      // Remove sensitive data from request body
      if (event.request && event.request.data) {
        const sensitiveKeys = ['password', 'token', 'refreshToken', 'accessToken', 'secret'];
        const sanitizedData = { ...event.request.data };
        
        sensitiveKeys.forEach(key => {
          if (sanitizedData[key]) {
            sanitizedData[key] = '***REDACTED***';
          }
        });
        
        event.request.data = sanitizedData;
      }

      return event;
    },
  });

  console.log(`Sentry initialized for environment: ${environment}`);
};

/**
 * Capture exception manually
 */
export const captureException = (error, context = {}) => {
  if (process.env.SENTRY_DSN) {
    Sentry.withScope((scope) => {
      // Add context
      Object.keys(context).forEach(key => {
        scope.setContext(key, context[key]);
      });
      Sentry.captureException(error);
    });
  }
};

/**
 * Capture message manually
 */
export const captureMessage = (message, level = 'info', context = {}) => {
  if (process.env.SENTRY_DSN) {
    Sentry.withScope((scope) => {
      Object.keys(context).forEach(key => {
        scope.setContext(key, context[key]);
      });
      Sentry.captureMessage(message, level);
    });
  }
};

/**
 * Add breadcrumb for tracking user actions
 */
export const addBreadcrumb = (message, category = 'default', data = {}) => {
  if (process.env.SENTRY_DSN) {
    Sentry.addBreadcrumb({
      message,
      category,
      level: 'info',
      data,
      timestamp: Date.now() / 1000,
    });
  }
};

/**
 * Set user context for tracking
 */
export const setUser = (user) => {
  if (process.env.SENTRY_DSN) {
    Sentry.setUser({
      id: user.id?.toString(),
      username: user.username,
      email: user.email,
      // Don't include sensitive data
    });
  }
};

/**
 * Clear user context
 */
export const clearUser = () => {
  if (process.env.SENTRY_DSN) {
    Sentry.setUser(null);
  }
};

export default Sentry;

