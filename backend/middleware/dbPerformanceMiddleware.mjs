/**
 * Database Performance Monitoring Middleware
 * ติดตาม query performance
 */

import performanceMonitor from '../utils/performance.mjs';
import { query as originalQuery } from '../utils/db.mjs';

// Wrap query function to track performance
export const trackQueryPerformance = (queryFn) => {
  return async (text, params) => {
    const startTime = Date.now();
    try {
      const result = await queryFn(text, params);
      const duration = Date.now() - startTime;
      
      // Record query performance
      performanceMonitor.recordQuery(text, duration);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      performanceMonitor.recordQuery(text, duration);
      throw error;
    }
  };
};

