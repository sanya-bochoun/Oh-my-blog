# คู่มือการใช้งาน Features ใหม่

## 📋 สารบัญ
1. [Database Backup](#database-backup)
2. [Performance Monitoring](#performance-monitoring)
3. [SEO Optimization (Frontend)](#seo-optimization-frontend)
4. [Enhanced Search](#enhanced-search)
5. [View Tracking / Analytics](#view-tracking--analytics)
6. [Comments Moderation (Admin)](#comments-moderation-admin)
7. [Tags System](#tags-system)
8. [CI/CD Pipeline](#cicd-pipeline)

---

## Database Backup

### วิธีใช้งาน Backup Script

#### 1. ตั้งค่า Environment Variables
ตรวจสอบว่า `.env` file มี database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ohmyblog
DB_USER=postgres
DB_PASSWORD=your_password
```

#### 2. รัน Backup
```bash
cd backend
npm run backup
```

หรือรันตรงๆ:
```bash
node scripts/backupDb.mjs
```

#### 3. Backup Files
Backup files จะถูกเก็บไว้ที่ `backend/backups/backup_YYYY-MM-DDTHH-mm-ss.sql`

#### 4. Restore จาก Backup
```bash
# ใช้ pg_restore (สำหรับ custom format)
pg_restore -h localhost -U postgres -d ohmyblog backups/backup_2024-01-01T00-00-00.sql

# หรือใช้ psql (สำหรับ SQL format)
psql -h localhost -U postgres -d ohmyblog < backups/backup_2024-01-01T00-00-00.sql
```

#### 5. Automated Backup (Cron Job)
ตั้งค่า cron job สำหรับ backup อัตโนมัติ:

**Linux/Mac:**
```bash
crontab -e
# เพิ่มบรรทัดนี้เพื่อ backup ทุกวันเวลา 2:00 AM
0 2 * * * cd /path/to/backend && npm run backup
```

**Windows Task Scheduler:**
1. เปิด Task Scheduler
2. Create Basic Task
3. Set trigger: Daily at 2:00 AM
4. Action: Start a program
5. Program: `node`
6. Arguments: `scripts/backupDb.mjs`
7. Start in: `C:\path\to\backend`

---

## Performance Monitoring

### 1. ตรวจสอบ Metrics (Admin Only)

#### ดึง Metrics ทั้งหมด
```bash
GET /api/admin/metrics
Authorization: Bearer <admin_token>
```

#### ดึง Metrics Summary
```bash
GET /api/admin/metrics/summary
Authorization: Bearer <admin_token>
```

#### Reset Metrics
```bash
POST /api/admin/metrics/reset
Authorization: Bearer <admin_token>
```

### 2. ตรวจสอบ Response Time
ทุก HTTP response จะมี header:
```
X-Response-Time: 45ms
```

### 3. ตรวจสอบ Logs
ใน production, metrics จะถูก log ทุก 5 นาที:
```
[INFO] Performance Metrics: {
  requests: { total: 1234, errors: 12, errorRate: '0.97%', averageResponseTime: '45.67ms' },
  database: { queries: 5000, averageQueryTime: '12.34ms', slowQueries: 5 },
  memory: { heapUsed: 150, heapTotal: 200, external: 50, rss: 300 },
  uptime: '86400s'
}
```

### 4. ตัวอย่าง Response
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

---

## SEO Optimization (Frontend)

### 1. ใช้งานใน Article Detail Page

เพิ่มใน `frontend/src/pages/ArticleDetail.jsx`:

```javascript
import { useEffect } from 'react';
import { setArticleSEO, generateArticleStructuredData, addStructuredData, removeStructuredData } from '../utils/seo';

function ArticleDetail() {
  const [article, setArticle] = useState(null);
  
  useEffect(() => {
    if (article) {
      // Set SEO meta tags
      setArticleSEO({
        title: article.title,
        description: article.introduction || article.excerpt,
        image: article.thumbnail_url || article.featured_image,
        url: window.location.href,
        author: article['Author.username'] || article.author_name,
        publishedTime: article.created_at,
        modifiedTime: article.updated_at,
        tags: article.tags || []
      });

      // Add structured data
      const structuredData = generateArticleStructuredData({
        title: article.title,
        description: article.introduction || article.excerpt,
        image: article.thumbnail_url || article.featured_image,
        url: window.location.href,
        author: article['Author.username'] || article.author_name,
        publishedTime: article.created_at,
        modifiedTime: article.updated_at
      });
      addStructuredData(structuredData);
    }

    // Cleanup
    return () => {
      removeStructuredData();
    };
  }, [article]);

  // ... rest of component
}
```

### 2. ใช้งานใน Pages อื่นๆ

```javascript
import { useEffect } from 'react';
import { setPageSEO, resetSEO } from '../utils/seo';

function HomePage() {
  useEffect(() => {
    setPageSEO({
      title: 'Home',
      description: 'Welcome to my blog',
      image: '/logo.svg',
      url: window.location.href
    });

    return () => {
      resetSEO();
    };
  }, []);

  // ... rest of component
}
```

### 3. ตั้งค่า Environment Variable
```env
VITE_APP_URL=https://your-domain.com
```

---

## Enhanced Search

### 1. Search Posts
```
GET /api/posts?search=keyword
```

ค้นหาใน: title, content, excerpt, tags, author name

### 2. Search Articles (Admin/Author)
```
GET /api/articles/search?q=keyword
Authorization: Bearer <token>
```

ค้นหาใน: title, content, excerpt, tags, author name

### 3. ตัวอย่าง
```bash
# Search posts
curl "http://localhost:5000/api/posts?search=javascript"

# Search with filters
curl "http://localhost:5000/api/posts?search=javascript&category=1&limit=10"
```

---

## View Tracking / Analytics

### 1. View Count
View count จะถูกเพิ่มอัตโนมัติเมื่อ:
- ดู article detail: `GET /api/articles/detail/:slug`
- ดู post: `GET /api/posts/:slug`

### 2. Popular Articles
```
GET /api/posts/popular?page=1&limit=10&days=30
```

Parameters:
- `page`: หน้า (default: 1)
- `limit`: จำนวนต่อหน้า (default: 10)
- `days`: จำนวนวันย้อนหลัง (default: 30)

### 3. ตัวอย่าง
```bash
# Get popular articles (last 30 days)
curl "http://localhost:5000/api/posts/popular"

# Get popular articles (last 7 days)
curl "http://localhost:5000/api/posts/popular?days=7"
```

---

## Comments Moderation (Admin)

### 1. ดึง Comments ทั้งหมด
```
GET /api/admin/comments?page=1&limit=20&is_approved=true
Authorization: Bearer <admin_token>
```

Query Parameters:
- `page`: หน้า (default: 1)
- `limit`: จำนวนต่อหน้า (default: 20, max: 100)
- `is_approved`: filter by approval status (true/false)
- `post_id`: filter by post ID
- `user_id`: filter by user ID

### 2. อนุมัติ Comment
```
PUT /api/admin/comments/:id/approve
Authorization: Bearer <admin_token>
```

### 3. ไม่อนุมัติ Comment
```
PUT /api/admin/comments/:id/reject
Authorization: Bearer <admin_token>
```

### 4. ลบ Comment
```
DELETE /api/admin/comments/:id
Authorization: Bearer <admin_token>
```

### 5. ดึง Comment Statistics
```
GET /api/admin/comments/stats
Authorization: Bearer <admin_token>
```

Response:
```json
{
  "status": "success",
  "data": {
    "total": 100,
    "approved": 85,
    "pending": 15
  }
}
```

### 6. ตัวอย่าง
```bash
# Get all comments
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5000/api/admin/comments"

# Get pending comments
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5000/api/admin/comments?is_approved=false"

# Approve comment
curl -X PUT -H "Authorization: Bearer <token>" \
  "http://localhost:5000/api/admin/comments/1/approve"

# Get statistics
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5000/api/admin/comments/stats"
```

---

## Tags System

### 1. ดึง Tags ทั้งหมด
```
GET /api/tags
```

### 2. ดึง Popular Tags
```
GET /api/tags/popular?limit=20
```

### 3. ดึง Tag by Slug
```
GET /api/tags/slug/:slug
```

### 4. ดึง Posts by Tag
```
GET /api/tags/:id/posts?page=1&limit=10
```

### 5. สร้าง Tag (Authenticated)
```
POST /api/tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "JavaScript"
}
```

### 6. อัปเดต Tag (Authenticated)
```
PUT /api/tags/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Tag Name"
}
```

### 7. ลบ Tag (Authenticated)
```
DELETE /api/tags/:id
Authorization: Bearer <token>
```

### 8. ตัวอย่าง
```bash
# Get all tags
curl "http://localhost:5000/api/tags"

# Get popular tags
curl "http://localhost:5000/api/tags/popular?limit=10"

# Get tag by slug
curl "http://localhost:5000/api/tags/slug/javascript"

# Get posts by tag
curl "http://localhost:5000/api/tags/1/posts?page=1&limit=10"

# Create tag
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"JavaScript"}' \
  "http://localhost:5000/api/tags"
```

---

## CI/CD Pipeline

### 1. ตั้งค่า GitHub Secrets (ถ้าต้องการ deploy)

ไปที่ GitHub Repository → Settings → Secrets and variables → Actions

เพิ่ม secrets:
- `VERCEL_TOKEN`: Vercel authentication token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID
- `VITE_API_URL`: Frontend API URL (optional)

### 2. Pipeline จะทำงานอัตโนมัติเมื่อ:
- Push code ไปยัง `main` หรือ `develop` branch
- สร้าง Pull Request ไปยัง `main` หรือ `develop` branch

### 3. Jobs ที่รัน:
- **Backend Tests**: รัน tests พร้อม PostgreSQL service
- **Frontend Tests**: Linting และ build
- **Security Scan**: npm audit
- **Deploy**: Auto deploy ไปยัง Vercel (เฉพาะ main branch)

### 4. ตรวจสอบผลลัพธ์
ไปที่ GitHub Repository → Actions tab เพื่อดู workflow runs

### 5. Manual Workflow Run
1. ไปที่ Actions tab
2. เลือก workflow "CI/CD Pipeline"
3. คลิก "Run workflow"
4. เลือก branch และคลิก "Run workflow"

---

## Quick Reference

### Backend API Endpoints

#### Public Endpoints
- `GET /api/posts?search=keyword` - Search posts
- `GET /api/posts/popular` - Popular posts
- `GET /api/posts/:slug` - Get post (with view tracking)
- `GET /api/articles/detail/:slug` - Get article (with view tracking)
- `GET /api/tags` - Get all tags
- `GET /api/tags/popular` - Popular tags
- `GET /api/tags/slug/:slug` - Get tag by slug
- `GET /api/tags/:id/posts` - Get posts by tag

#### Admin Endpoints
- `GET /api/admin/comments` - Get all comments
- `GET /api/admin/comments/stats` - Comment statistics
- `PUT /api/admin/comments/:id/approve` - Approve comment
- `PUT /api/admin/comments/:id/reject` - Reject comment
- `DELETE /api/admin/comments/:id` - Delete comment
- `GET /api/admin/metrics` - Get performance metrics
- `GET /api/admin/metrics/summary` - Get metrics summary
- `POST /api/admin/metrics/reset` - Reset metrics

### Frontend Utilities

#### SEO Utilities (`frontend/src/utils/seo.js`)
- `setArticleSEO(options)` - Set SEO for article
- `setPageSEO(options)` - Set SEO for page
- `setTitle(title)` - Set document title
- `resetSEO()` - Reset to default
- `generateArticleStructuredData(options)` - Generate JSON-LD
- `addStructuredData(data)` - Add structured data
- `removeStructuredData()` - Remove structured data

### Scripts

#### Backend
- `npm run backup` - Create database backup
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage

---

## Tips & Best Practices

1. **Backup**: รัน backup เป็นประจำ (แนะนำทุกวัน)
2. **Performance Monitoring**: ตรวจสอบ metrics เป็นประจำ (แนะนำทุกวันหรือทุกสัปดาห์)
3. **SEO**: ตั้งค่า SEO tags ในทุก page ที่สำคัญ
4. **Search**: ใช้ enhanced search เพื่อให้ผู้ใช้ค้นหาง่ายขึ้น
5. **Comments**: ตรวจสอบและอนุมัติ comments เป็นประจำ
6. **Tags**: ใช้ tags เพื่อจัดระเบียบเนื้อหา
7. **CI/CD**: ตรวจสอบ workflow runs หลังจาก push code

---

## Troubleshooting

### Backup ไม่ทำงาน
- ตรวจสอบ database credentials ใน `.env`
- ตรวจสอบว่า pg_dump อยู่ใน PATH
- ตรวจสอบ permissions ของ backup directory

### Performance Metrics ไม่แสดง
- ตรวจสอบว่า performance middleware ถูก apply แล้ว
- ตรวจสอบว่าเป็น admin user
- ตรวจสอบ token authentication

### SEO Tags ไม่ทำงาน
- ตรวจสอบว่าเรียกใช้ SEO functions ใน useEffect
- ตรวจสอบ console สำหรับ errors
- ตรวจสอบว่าใช้ browser ที่รองรับ dynamic meta tags

### CI/CD Pipeline ล้มเหลว
- ตรวจสอบ GitHub Actions logs
- ตรวจสอบ environment variables
- ตรวจสอบว่า tests ผ่านใน local
- ตรวจสอบ database connection ใน CI

