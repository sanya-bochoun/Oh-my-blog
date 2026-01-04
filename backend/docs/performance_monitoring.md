# Performance Monitoring Guide

## Overview
เอกสารนี้อธิบายเกี่ยวกับ performance monitoring system ที่มีใน Oh!myBlog application

## Features

### 1. Request Performance Tracking
- ติดตาม response time ของทุก HTTP request
- ตรวจจับ slow requests (> 1 second)
- คำนวณ average response time
- แยกตาม HTTP method และ route

### 2. Database Query Performance
- ติดตาม query execution time
- ตรวจจับ slow queries (> 500ms)
- เก็บประวัติ slow queries (100 queries ล่าสุด)
- คำนวณ average query time

### 3. Memory Monitoring
- ติดตาม heap memory usage
- ติดตาม external memory usage
- ติดตาม RSS (Resident Set Size)

### 4. Metrics API
- RESTful API สำหรับดึง metrics
- Summary endpoint สำหรับ overview
- Reset endpoint สำหรับ reset metrics

## Usage

### Middleware Setup

Performance middleware ถูก apply อัตโนมัติใน `server.mjs`:

```javascript
import { performanceMiddleware } from './middleware/performanceMiddleware.mjs';
app.use(performanceMiddleware);
```

### Accessing Metrics

#### Get Full Metrics (Admin Only)
```bash
GET /api/admin/metrics
Authorization: Bearer <admin_token>
```

Response:
```json
{
  "status": "success",
  "data": {
    "requests": {
      "total": 1234,
      "byMethod": {
        "GET": 800,
        "POST": 300,
        "PUT": 100,
        "DELETE": 34
      },
      "byRoute": {
        "/api/articles": {
          "count": 200,
          "totalTime": 5000,
          "averageTime": 25
        }
      },
      "errors": 12,
      "averageResponseTime": 45.67
    },
    "database": {
      "queries": 5000,
      "slowQueries": [
        {
          "query": "SELECT * FROM posts...",
          "duration": 750,
          "timestamp": "2024-01-01T00:00:00Z"
        }
      ],
      "averageQueryTime": 12.34
    },
    "memory": {
      "heapUsed": 150,
      "heapTotal": 200,
      "external": 50,
      "rss": 300
    },
    "uptime": 86400,
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

#### Get Metrics Summary (Admin Only)
```bash
GET /api/admin/metrics/summary
Authorization: Bearer <admin_token>
```

Response:
```json
{
  "status": "success",
  "data": {
    "requests": {
      "total": 1234,
      "errors": 12,
      "errorRate": "0.97%",
      "averageResponseTime": "45.67ms"
    },
    "database": {
      "queries": 5000,
      "averageQueryTime": "12.34ms",
      "slowQueries": 5
    },
    "memory": {
      "heapUsed": 150,
      "heapTotal": 200,
      "external": 50,
      "rss": 300
    },
    "uptime": "86400s"
  }
}
```

#### Reset Metrics (Admin Only)
```bash
POST /api/admin/metrics/reset
Authorization: Bearer <admin_token>
```

## Automatic Logging

ใน production environment, ระบบจะ log performance metrics ทุก 5 นาที:

```
[INFO] Performance Metrics: {
  requests: { total: 1234, errors: 12, errorRate: '0.97%', averageResponseTime: '45.67ms' },
  database: { queries: 5000, averageQueryTime: '12.34ms', slowQueries: 5 },
  memory: { heapUsed: 150, heapTotal: 200, external: 50, rss: 300 },
  uptime: '86400s'
}
```

## Response Headers

ทุก HTTP response จะมี header:
```
X-Response-Time: 45ms
```

## Integration with Sentry

Performance monitoring สามารถ integrate กับ Sentry สำหรับ:
- Error tracking
- Performance monitoring
- Release tracking

ดูเพิ่มเติมที่: `backend/utils/sentry.mjs`

## Best Practices

1. **Monitor Regularly**: ตรวจสอบ metrics เป็นประจำ
2. **Set Alerts**: ตั้งค่า alerts สำหรับ:
   - High error rate (> 5%)
   - Slow average response time (> 500ms)
   - High memory usage (> 80% of available)
3. **Investigate Slow Queries**: ตรวจสอบ slow queries และ optimize
4. **Review Metrics**: วิเคราะห์ metrics เพื่อหา bottlenecks

## Performance Targets

### Response Time Targets
- **Fast**: < 100ms
- **Acceptable**: 100-500ms
- **Slow**: > 500ms (should be investigated)

### Database Query Targets
- **Fast**: < 50ms
- **Acceptable**: 50-200ms
- **Slow**: > 200ms (should be optimized)

### Memory Usage Targets
- **Normal**: < 70% of available
- **Warning**: 70-85% of available
- **Critical**: > 85% of available

## Troubleshooting

### High Response Times
1. ตรวจสอบ slow queries
2. ตรวจสอบ database connection pool
3. ตรวจสอบ external API calls
4. ตรวจสอบ memory usage

### High Error Rate
1. ตรวจสอบ error logs
2. ตรวจสอบ database connectivity
3. ตรวจสอบ external dependencies
4. ตรวจสอบ rate limiting

### Memory Leaks
1. ตรวจสอบ memory usage trends
2. ตรวจสอบ unclosed connections
3. ตรวจสอบ large data structures
4. ใช้ heap dump analysis

## Future Enhancements

1. **Real-time Dashboard**: สร้าง dashboard สำหรับแสดง metrics แบบ real-time
2. **Alerting System**: เพิ่ม alerting system (email, Slack, etc.)
3. **Historical Data**: เก็บ historical metrics ใน database
4. **APM Integration**: Integrate กับ APM tools (New Relic, Datadog, etc.)

