/**
 * Performance Monitoring Middleware
 * ติดตาม response time และ request metrics
 */

import performanceMonitor from '../utils/performance.mjs';

export const performanceMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const method = req.method;
  const route = req.route?.path || req.path;

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    
    // Record metrics
    performanceMonitor.recordRequest(
      method,
      route,
      res.statusCode,
      responseTime
    );

    // Add response time header
    res.setHeader('X-Response-Time', `${responseTime}ms`);

    // Call original end
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

