# Sentry Error Tracking Documentation

## Overview

โปรเจกต์นี้ใช้ **Sentry** สำหรับ error tracking และ monitoring เพื่อช่วยในการติดตามและแก้ไข errors ใน production environment

## Features

- **Error Tracking**: ติดตาม errors อัตโนมัติ
- **Performance Monitoring**: ติดตาม performance ของ API endpoints
- **User Context**: เก็บข้อมูล user ที่เกิด error
- **Breadcrumbs**: ติดตาม user actions ก่อนเกิด error
- **Release Tracking**: ติดตาม errors แยกตาม release version
- **Sensitive Data Filtering**: กรองข้อมูลที่ sensitive อัตโนมัติ

## Setup

### 1. สร้าง Sentry Account และ Project

1. ไปที่ https://sentry.io
2. สมัคร account (หรือ login)
3. สร้าง project ใหม่ (เลือก Node.js)
4. Copy DSN (Data Source Name)

### 2. ตั้งค่า Environment Variables

เพิ่มในไฟล์ `.env`:

```env
# Sentry Configuration
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_RELEASE=1.0.0  # Optional: สำหรับ release tracking
SENTRY_ENABLE_DEV=false  # Set to 'true' to enable in development
```

**หมายเหตุ**: 
- `SENTRY_DSN`: จำเป็น (หากไม่มีจะไม่ initialize Sentry)
- `SENTRY_RELEASE`: ไม่บังคับ (สำหรับติดตาม errors ตาม version)
- `SENTRY_ENABLE_DEV`: ไม่บังคับ (default: false - ไม่ส่ง errors ใน development mode)

### 3. Verify Installation

หลังจากตั้งค่าแล้ว รัน server และลองทำให้เกิด error ดู errors ใน Sentry dashboard

## Usage

### Automatic Error Tracking

Errors จะถูก track อัตโนมัติผ่าน `errorHandler` middleware:

```javascript
// Errors ถูก track อัตโนมัติ
export const someController = async (req, res, next) => {
  try {
    // ... your code
  } catch (error) {
    next(error); // Error จะถูกส่งไปยัง errorHandler และ Sentry
  }
};
```

### Manual Error Tracking

```javascript
import { captureException, captureMessage, addBreadcrumb, setUser } from '../utils/sentry.mjs';

// Capture exception manually
try {
  // ... code that might throw
} catch (error) {
  captureException(error, {
    extra: {
      userId: user.id,
      action: 'create_article'
    }
  });
  throw error;
}

// Capture message
captureMessage('Something unusual happened', 'warning', {
  context: {
    userId: user.id,
    data: someData
  }
});

// Add breadcrumb (track user actions)
addBreadcrumb('User clicked button', 'user-action', {
  buttonId: 'submit',
  page: '/articles/create'
});

// Set user context
setUser({
  id: user.id,
  username: user.username,
  email: user.email
});

// Clear user context (e.g., on logout)
clearUser();
```

### ใน Controllers

```javascript
import { captureException, setUser, addBreadcrumb } from '../utils/sentry.mjs';

export const login = async (req, res, next) => {
  try {
    addBreadcrumb('Login attempt', 'auth', { email: req.body.email });
    
    // ... login logic
    
    setUser(user); // Set user context for tracking
    addBreadcrumb('Login successful', 'auth', { userId: user.id });
    
    res.json({ success: true });
  } catch (error) {
    captureException(error, {
      tags: {
        action: 'login',
        email: req.body.email
      }
    });
    next(error);
  }
};
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SENTRY_DSN` | Yes | - | Sentry DSN from project settings |
| `SENTRY_RELEASE` | No | - | Release version for tracking |
| `SENTRY_ENABLE_DEV` | No | `false` | Enable Sentry in development mode |

### Sampling Rates

- **Production**: 
  - Traces: 10% (0.1)
  - Profiles: 10% (0.1)
- **Development**: 
  - Traces: 100% (1.0)
  - Profiles: 100% (1.0)

สามารถปรับได้ใน `backend/utils/sentry.mjs`

## Security

### Sensitive Data Filtering

Sentry จะกรองข้อมูลที่ sensitive อัตโนมัติ:

- `password`
- `token`
- `refreshToken`
- `accessToken`
- `secret`

ข้อมูลเหล่านี้จะถูกแสดงเป็น `***REDACTED***` ใน Sentry dashboard

### Development Mode

โดย default Sentry จะ **ไม่ส่ง errors** ใน development mode เพื่อประหยัด quota

หากต้องการทดสอบ Sentry ใน development mode:
```env
SENTRY_ENABLE_DEV=true
```

## Best Practices

1. **Set User Context**: ตั้งค่า user context เพื่อติดตามว่าใครเกิด error
   ```javascript
   setUser({ id: user.id, username: user.username });
   ```

2. **Add Breadcrumbs**: เพิ่ม breadcrumbs เพื่อติดตาม user actions
   ```javascript
   addBreadcrumb('User action', 'category', { data: info });
   ```

3. **Use Tags**: ใช้ tags เพื่อจัดกลุ่ม errors
   ```javascript
   captureException(error, {
     tags: {
       component: 'auth',
       action: 'login'
     }
   });
   ```

4. **Don't Send Sensitive Data**: หลีกเลี่ยงการส่งข้อมูล sensitive (passwords, tokens, etc.)

5. **Use Release Tracking**: ใช้ `SENTRY_RELEASE` เพื่อติดตาม errors ตาม version

## Monitoring

### Viewing Errors

1. ไปที่ Sentry dashboard: https://sentry.io
2. เลือก project ของคุณ
3. ดู errors ใน "Issues" tab

### Performance Monitoring

Sentry จะ track performance ของ:
- API endpoints
- Database queries
- External API calls

ดูได้ใน "Performance" tab

## Troubleshooting

### Sentry ไม่ทำงาน

1. ตรวจสอบว่า `SENTRY_DSN` ถูกตั้งค่าใน `.env`
2. ตรวจสอบ console logs ว่า Sentry initialize สำเร็จ
3. ตรวจสอบว่า `SENTRY_ENABLE_DEV=true` ถ้าต้องการใช้ใน development mode

### Errors ไม่แสดงใน Sentry

1. ตรวจสอบว่า DSN ถูกต้อง
2. ตรวจสอบ network connection
3. ตรวจสอบ quota ใน Sentry account (free tier มีข้อจำกัด)

## Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Sentry Node.js SDK](https://docs.sentry.io/platforms/javascript/guides/node/)
- [Sentry Dashboard](https://sentry.io)

