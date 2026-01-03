# Logging Documentation

## Overview

โปรเจกต์นี้ใช้ **Winston** สำหรับ structured logging เพื่อให้สามารถติดตามและวิเคราะห์ logs ได้อย่างมีประสิทธิภาพ

## Features

- **Structured Logging**: Logs ถูกจัดรูปแบบเป็น JSON ใน production mode
- **Multiple Transports**: Console (development) และ File (production)
- **Log Levels**: error, warn, info, verbose, debug, silly
- **Automatic Log Rotation**: ไฟล์ logs จะถูก rotate เมื่อขนาดเกิน 5MB (เก็บสูงสุด 5 ไฟล์)
- **Error Tracking**: จัดการ uncaught exceptions และ unhandled promise rejections

## Usage

### Basic Usage

```javascript
import logger from './utils/logger.mjs';

// Log levels
logger.error('Error message', { error: err, userId: 123 });
logger.warn('Warning message', { data: someData });
logger.info('Info message', { action: 'user_login', userId: 123 });
logger.debug('Debug message', { details: debugInfo });
```

### ใน Controllers

```javascript
import logger from '../utils/logger.mjs';

export const login = async (req, res, next) => {
  try {
    logger.info('Login attempt', { email: req.body.email });
    // ... login logic
    logger.info('Login successful', { userId: user.id });
  } catch (error) {
    logger.error('Login failed', { 
      error: error.message,
      email: req.body.email 
    });
    next(error);
  }
};
```

### ใน Middleware

```javascript
import logger from '../utils/logger.mjs';

export const authMiddleware = (req, res, next) => {
  try {
    // ... auth logic
    logger.debug('Authentication successful', { userId: req.user.id });
    next();
  } catch (error) {
    logger.warn('Authentication failed', { 
      path: req.path,
      ip: req.ip 
    });
    next(error);
  }
};
```

## Log Files

ใน production mode หรือเมื่อ `LOG_TO_FILE=true`, logs จะถูกบันทึกในโฟลเดอร์ `backend/logs/`:

- `error.log`: เก็บเฉพาะ error level logs
- `combined.log`: เก็บทุก level logs
- `exceptions.log`: เก็บ uncaught exceptions
- `rejections.log`: เก็บ unhandled promise rejections

## Environment Variables

- `LOG_LEVEL`: กำหนด log level (default: 'info' ใน production, 'debug' ใน development)
- `LOG_TO_FILE`: เปิดการบันทึก logs ลงไฟล์แม้ใน development mode (default: false)
- `NODE_ENV`: กำหนด environment (development/production)

## Morgan HTTP Logging

Morgan middleware ถูก integrate กับ Winston แล้ว:
- Development: ใช้ format 'dev' และแสดงใน console
- Production: ใช้ format 'combined' และบันทึกลงไฟล์ผ่าน Winston

## Best Practices

1. **ใช้ log levels ให้เหมาะสม**:
   - `error`: สำหรับ errors ที่ต้องแก้ไข
   - `warn`: สำหรับ warnings ที่ควรระวัง
   - `info`: สำหรับข้อมูลทั่วไป (เช่น user actions)
   - `debug`: สำหรับข้อมูล debugging

2. **เพิ่ม context ใน logs**:
   ```javascript
   logger.info('User action', {
     userId: user.id,
     action: 'create_article',
     articleId: article.id,
     ip: req.ip
   });
   ```

3. **ไม่ log sensitive data**:
   - ไม่ log passwords, tokens, credit card numbers
   - ใช้ `***` แทน sensitive data

4. **ใช้ structured logging**:
   ```javascript
   // Good
   logger.error('Database error', { error: err.message, query: query });
   
   // Bad
   logger.error(`Database error: ${err.message} for query: ${query}`);
   ```

## Log Rotation

Log files จะถูก rotate อัตโนมัติ:
- Max file size: 5MB
- Max files: 5 files per log type
- Old files จะถูกลบอัตโนมัติ

