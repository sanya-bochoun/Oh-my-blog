# Redis Caching Documentation

## Overview

โปรเจกต์นี้ใช้ **Redis** สำหรับ caching เพื่อเพิ่ม performance และลด load บน database

## Features

- **Automatic Caching**: Cache API responses อัตโนมัติ
- **Cache Invalidation**: ลบ cache เมื่อข้อมูลเปลี่ยนแปลง
- **TTL Support**: ตั้งค่า time-to-live สำหรับ cache entries
- **Pattern-based Invalidation**: ลบ cache หลาย keys ด้วย pattern
- **Graceful Degradation**: App ยังทำงานได้ถ้า Redis ไม่ available

## Setup

### 1. Install Redis

#### Local Development (Windows)

ใช้ Redis via Docker:
```bash
docker run -d -p 6379:6379 redis:alpine
```

หรือติดตั้ง Redis for Windows:
- Download จาก: https://github.com/microsoftarchive/redis/releases
- หรือใช้ WSL2: `sudo apt-get install redis-server`

#### Production

ใช้ Redis service:
- **Redis Cloud**: https://redis.com/try-free/
- **Upstash**: https://upstash.com/
- **AWS ElastiCache**: https://aws.amazon.com/elasticache/
- **Azure Cache for Redis**: https://azure.microsoft.com/services/cache/

### 2. Environment Variables

เพิ่มในไฟล์ `.env`:

```env
# Option 1: Redis URL (recommended for production)
REDIS_URL=redis://:password@host:port

# Option 2: Separate configuration (for local development)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password  # Optional, only if Redis has password
```

**หมายเหตุ**: 
- หากไม่ตั้งค่า Redis variables, app จะทำงานปกติแต่ไม่มี caching
- Redis เป็น optional - app สามารถทำงานได้โดยไม่มี Redis

## Usage

### Basic Cache Operations

```javascript
import cache from '../utils/cache.mjs';

// Get from cache
const cached = await cache.get('my-key');
if (cached) {
  return cached;
}

// Set cache (TTL: 3600 seconds = 1 hour)
await cache.set('my-key', data, 3600);

// Delete cache
await cache.del('my-key');

// Delete multiple keys by pattern
await cache.delPattern('categories:*');
```

### In Controllers

```javascript
import cache from '../utils/cache.mjs';

export const getAllCategories = async (req, res) => {
  try {
    const cacheKey = 'categories:all';
    
    // Try to get from cache
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    // Fetch from database
    const result = await query('SELECT * FROM categories ORDER BY name');
    const response = {
      status: 'success',
      data: result.rows
    };
    
    // Cache for 1 hour
    await cache.set(cacheKey, response, 3600);
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
```

### Cache Invalidation

เมื่อข้อมูลเปลี่ยนแปลง ควร invalidate cache:

```javascript
export const createCategory = async (req, res) => {
  try {
    // ... create category logic
    
    // Invalidate cache
    await cache.invalidateCache(['categories:*']);
    
    res.json(response);
  } catch (error) {
    // ...
  }
};

export const updateCategory = async (req, res) => {
  try {
    // ... update logic
    
    // Invalidate specific category and all categories list
    await cache.invalidateCache([
      `categories:${req.params.id}`,
      'categories:*'
    ]);
    
    res.json(response);
  } catch (error) {
    // ...
  }
};
```

## Cache Keys Pattern

ใช้ pattern ที่สอดคล้องกัน:

- `categories:all` - All categories list
- `categories:{id}` - Single category by ID
- `articles:all` - All articles list
- `articles:{id}` - Single article by ID
- `articles:published` - Published articles only
- `articles:category:{categoryId}` - Articles by category

## TTL (Time To Live)

TTL คือเวลาที่ cache จะ expire (หน่วยเป็นวินาที):

- **Categories**: 1 hour (3600 seconds) - เปลี่ยนแปลงไม่บ่อย
- **Articles**: 30 minutes (1800 seconds) - เปลี่ยนแปลงบ่อยกว่า
- **Popular Articles**: 1 hour (3600 seconds)
- **User Data**: 15 minutes (900 seconds)

## Cache Middleware (Future Enhancement)

```javascript
import { cacheMiddleware } from '../utils/cache.mjs';

// Use cache middleware
router.get('/categories', 
  cacheMiddleware(3600, (req) => `categories:${req.query.page || 'all'}`),
  getAllCategories
);
```

## Monitoring

### Check Redis Connection

```javascript
import { isRedisAvailable } from '../utils/cache.mjs';

const available = await isRedisAvailable();
console.log('Redis available:', available);
```

### View Cache Stats

ใน Redis CLI:
```bash
redis-cli
> INFO stats
> KEYS *
> TTL categories:all
```

## Best Practices

1. **Use Consistent Key Patterns**: ใช้ pattern ที่สอดคล้องกัน
   ```javascript
   `categories:all`
   `categories:${id}`
   `articles:published:page:${page}`
   ```

2. **Set Appropriate TTL**: 
   - ข้อมูลที่เปลี่ยนแปลงบ่อย: TTL สั้น (15-30 นาที)
   - ข้อมูลที่เปลี่ยนแปลงไม่บ่อย: TTL ยาว (1-24 ชั่วโมง)

3. **Invalidate on Write Operations**:
   - CREATE: Invalidate list cache
   - UPDATE: Invalidate specific item + list cache
   - DELETE: Invalidate specific item + list cache

4. **Handle Cache Misses Gracefully**: App ต้องทำงานได้แม้ cache ไม่ available

5. **Don't Cache Sensitive Data**: หลีกเลี่ยงการ cache ข้อมูลที่ sensitive

6. **Monitor Cache Hit Rate**: ติดตาม cache hit rate เพื่อปรับ TTL

## Troubleshooting

### Redis ไม่เชื่อมต่อ

1. ตรวจสอบว่า Redis กำลังทำงาน:
   ```bash
   redis-cli ping
   # ควรได้: PONG
   ```

2. ตรวจสอบ environment variables

3. ตรวจสอบ firewall/network connection

4. ดู logs ใน backend (logger จะแสดง error ถ้า Redis ไม่เชื่อมต่อ)

### Cache ไม่ทำงาน

1. ตรวจสอบว่า Redis variables ถูกตั้งค่า
2. ตรวจสอบว่า `isRedisAvailable()` return true
3. ตรวจสอบ logs สำหรับ error messages

### Performance Issues

1. ตรวจสอบ Redis memory usage: `INFO memory`
2. ตรวจสอบจำนวน keys: `DBSIZE`
3. ตรวจสอบ slow queries: `SLOWLOG GET 10`

## Production Considerations

1. **Use Redis Cluster**: สำหรับ high availability
2. **Set Memory Limits**: ตั้งค่า maxmemory และ eviction policy
3. **Enable Persistence**: ใช้ AOF หรือ RDB สำหรับ data persistence
4. **Monitor Memory Usage**: ติดตาม memory usage
5. **Use Connection Pooling**: สำหรับ production workloads

## Resources

- [Redis Documentation](https://redis.io/docs/)
- [ioredis Documentation](https://github.com/luin/ioredis)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)

