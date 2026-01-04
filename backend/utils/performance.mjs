/**
 * Performance Monitoring Utilities
 * สำหรับติดตาม performance metrics ของ application
 */

import logger from './logger.mjs';

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        byMethod: {},
        byRoute: {},
        errors: 0,
        averageResponseTime: 0
      },
      database: {
        queries: 0,
        slowQueries: [],
        averageQueryTime: 0
      },
      memory: {
        heapUsed: 0,
        heapTotal: 0,
        external: 0
      }
    };
    this.responseTimes = [];
    this.queryTimes = [];
  }

  /**
   * Record HTTP request
   */
  recordRequest(method, route, statusCode, responseTime) {
    this.metrics.requests.total++;
    
    // Track by method
    if (!this.metrics.requests.byMethod[method]) {
      this.metrics.requests.byMethod[method] = 0;
    }
    this.metrics.requests.byMethod[method]++;

    // Track by route
    if (!this.metrics.requests.byRoute[route]) {
      this.metrics.requests.byRoute[route] = {
        count: 0,
        totalTime: 0,
        averageTime: 0
      };
    }
    this.metrics.requests.byRoute[route].count++;
    this.metrics.requests.byRoute[route].totalTime += responseTime;
    this.metrics.requests.byRoute[route].averageTime = 
      this.metrics.requests.byRoute[route].totalTime / 
      this.metrics.requests.byRoute[route].count;

    // Track errors
    if (statusCode >= 400) {
      this.metrics.requests.errors++;
    }

    // Track response times (keep last 1000)
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift();
    }

    // Calculate average response time
    const sum = this.responseTimes.reduce((a, b) => a + b, 0);
    this.metrics.requests.averageResponseTime = sum / this.responseTimes.length;

    // Log slow requests (> 1 second)
    if (responseTime > 1000) {
      logger.warn(`Slow request detected: ${method} ${route} - ${responseTime}ms`);
    }
  }

  /**
   * Record database query
   */
  recordQuery(query, duration) {
    this.metrics.database.queries++;

    // Track query times (keep last 1000)
    this.queryTimes.push(duration);
    if (this.queryTimes.length > 1000) {
      this.queryTimes.shift();
    }

    // Calculate average query time
    const sum = this.queryTimes.reduce((a, b) => a + b, 0);
    this.metrics.database.averageQueryTime = sum / this.queryTimes.length;

    // Track slow queries (> 500ms)
    if (duration > 500) {
      this.metrics.database.slowQueries.push({
        query: query.substring(0, 100), // Truncate long queries
        duration,
        timestamp: new Date().toISOString()
      });

      // Keep only last 100 slow queries
      if (this.metrics.database.slowQueries.length > 100) {
        this.metrics.database.slowQueries.shift();
      }

      logger.warn(`Slow query detected: ${duration}ms - ${query.substring(0, 100)}`);
    }
  }

  /**
   * Update memory metrics
   */
  updateMemoryMetrics() {
    const usage = process.memoryUsage();
    this.metrics.memory = {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
      rss: Math.round(usage.rss / 1024 / 1024) // MB
    };
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    this.updateMemoryMetrics();
    return {
      ...this.metrics,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get metrics summary
   */
  getSummary() {
    this.updateMemoryMetrics();
    const errorRate = this.metrics.requests.total > 0
      ? (this.metrics.requests.errors / this.metrics.requests.total * 100).toFixed(2)
      : 0;

    return {
      requests: {
        total: this.metrics.requests.total,
        errors: this.metrics.requests.errors,
        errorRate: `${errorRate}%`,
        averageResponseTime: `${this.metrics.requests.averageResponseTime.toFixed(2)}ms`
      },
      database: {
        queries: this.metrics.database.queries,
        averageQueryTime: `${this.metrics.database.averageQueryTime.toFixed(2)}ms`,
        slowQueries: this.metrics.database.slowQueries.length
      },
      memory: this.metrics.memory,
      uptime: `${Math.round(process.uptime())}s`
    };
  }

  /**
   * Reset metrics
   */
  reset() {
    this.metrics = {
      requests: {
        total: 0,
        byMethod: {},
        byRoute: {},
        errors: 0,
        averageResponseTime: 0
      },
      database: {
        queries: 0,
        slowQueries: [],
        averageQueryTime: 0
      },
      memory: {
        heapUsed: 0,
        heapTotal: 0,
        external: 0
      }
    };
    this.responseTimes = [];
    this.queryTimes = [];
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Log metrics periodically (every 5 minutes)
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    const summary = performanceMonitor.getSummary();
    logger.info('Performance Metrics:', summary);
  }, 5 * 60 * 1000); // 5 minutes
}

export default performanceMonitor;

