import Redis from 'ioredis';
import logger from './logger.mjs';

let redisClient = null;

/**
 * Initialize Redis client
 */
export const initRedis = () => {
  const redisUrl = process.env.REDIS_URL;
  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = process.env.REDIS_PORT || 6379;
  const redisPassword = process.env.REDIS_PASSWORD;

  try {
    if (redisUrl) {
      // Use Redis URL (for production services like Redis Cloud, Upstash, etc.)
      redisClient = new Redis(redisUrl, {
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });
    } else {
      // Use host/port configuration
      redisClient = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });
    }

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('error', (err) => {
      logger.error('Redis client error', { error: err.message });
      // Don't throw error - app can continue without cache
    });

    redisClient.on('close', () => {
      logger.warn('Redis client connection closed');
    });

    return redisClient;
  } catch (error) {
    logger.error('Failed to initialize Redis', { error: error.message });
    return null;
  }
};

/**
 * Get Redis client instance
 */
export const getRedisClient = () => {
  if (!redisClient) {
    redisClient = initRedis();
  }
  return redisClient;
};

/**
 * Check if Redis is available
 */
export const isRedisAvailable = async () => {
  if (!redisClient) {
    return false;
  }
  try {
    await redisClient.ping();
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} - Cached value or null
 */
export const get = async (key) => {
  if (!redisClient) {
    return null;
  }

  try {
    const value = await redisClient.get(key);
    if (value) {
      return JSON.parse(value);
    }
    return null;
  } catch (error) {
    logger.error('Redis GET error', { key, error: error.message });
    return null;
  }
};

/**
 * Set value in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (default: 3600 = 1 hour)
 * @returns {Promise<boolean>} - Success status
 */
export const set = async (key, value, ttl = 3600) => {
  if (!redisClient) {
    return false;
  }

  try {
    const serialized = JSON.stringify(value);
    if (ttl > 0) {
      await redisClient.setex(key, ttl, serialized);
    } else {
      await redisClient.set(key, serialized);
    }
    return true;
  } catch (error) {
    logger.error('Redis SET error', { key, error: error.message });
    return false;
  }
};

/**
 * Delete value from cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} - Success status
 */
export const del = async (key) => {
  if (!redisClient) {
    return false;
  }

  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error('Redis DEL error', { key, error: error.message });
    return false;
  }
};

/**
 * Delete multiple keys matching pattern
 * @param {string} pattern - Pattern to match (e.g., 'articles:*')
 * @returns {Promise<number>} - Number of keys deleted
 */
export const delPattern = async (pattern) => {
  if (!redisClient) {
    return 0;
  }

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length === 0) {
      return 0;
    }
    await redisClient.del(...keys);
    return keys.length;
  } catch (error) {
    logger.error('Redis DEL pattern error', { pattern, error: error.message });
    return 0;
  }
};

/**
 * Cache middleware for Express routes
 * @param {number} ttl - Time to live in seconds
 * @param {Function} keyGenerator - Function to generate cache key from request
 * @returns {Function} - Express middleware
 */
export const cacheMiddleware = (ttl = 3600, keyGenerator = null) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Check if Redis is available
    if (!(await isRedisAvailable())) {
      return next();
    }

    // Generate cache key
    const key = keyGenerator
      ? keyGenerator(req)
      : `cache:${req.originalUrl}`;

    try {
      // Try to get from cache
      const cached = await get(key);
      if (cached) {
        logger.debug('Cache hit', { key });
        return res.json(cached);
      }

      // Cache miss - override res.json to cache response
      const originalJson = res.json.bind(res);
      res.json = function (data) {
        set(key, data, ttl).catch((err) => {
          logger.error('Failed to cache response', { key, error: err.message });
        });
        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error', { error: error.message });
      next();
    }
  };
};

/**
 * Invalidate cache for specific patterns
 * @param {string|string[]} patterns - Cache key patterns to invalidate
 */
export const invalidateCache = async (patterns) => {
  if (!(await isRedisAvailable())) {
    return;
  }

  const patternArray = Array.isArray(patterns) ? patterns : [patterns];
  for (const pattern of patternArray) {
    const deleted = await delPattern(pattern);
    if (deleted > 0) {
      logger.info('Cache invalidated', { pattern, count: deleted });
    }
  }
};

/**
 * Close Redis connection
 */
export const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
};

// Initialize Redis on module load
if (process.env.REDIS_URL || process.env.REDIS_HOST) {
  initRedis();
}

export default {
  get,
  set,
  del,
  delPattern,
  cacheMiddleware,
  invalidateCache,
  isRedisAvailable,
  getRedisClient,
  closeRedis,
};

