# Testing Documentation

## Overview

โปรเจกต์ใช้ Jest เป็น test runner สำหรับ unit tests และ integration tests

## Setup

### Installation

Dependencies ถูกติดตั้งแล้ว:
- `jest` - Test runner
- `@jest/globals` - Jest globals for ES modules
- `supertest` - HTTP assertion library

### Configuration

Jest configuration อยู่ใน `jest.config.mjs`:

- **Test Environment**: Node.js
- **ES Modules**: รองรับ `.mjs` files
- **Test Match**: `**/__tests__/**/*.mjs`, `**/tests/**/*.test.mjs`
- **Coverage**: รวบรวม coverage จาก `controllers/`, `middleware/`, `utils/`, `routes/`

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

## Test Structure

```
backend/
  __tests__/
    setup.mjs              # Test setup และ global configuration
    auth.test.mjs          # Authentication API tests
    userManagement.test.mjs # User management API tests
    utils.test.mjs         # Utility functions tests
  tests/
    (legacy test files)
```

## Writing Tests

### Basic Test Structure

```javascript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../app.mjs';

describe('Feature Name', () => {
  beforeAll(async () => {
    // Setup code
  });

  afterAll(async () => {
    // Cleanup code
  });

  describe('Endpoint Name', () => {
    it('should do something', async () => {
      const response = await request(app)
        .get('/api/endpoint')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
    });
  });
});
```

### API Testing with Supertest

```javascript
import request from 'supertest';
import app from '../app.mjs';

// GET request
const response = await request(app)
  .get('/api/endpoint')
  .expect(200);

// POST request with body
const response = await request(app)
  .post('/api/endpoint')
  .send({ key: 'value' })
  .expect(201);

// Request with headers
const response = await request(app)
  .get('/api/protected')
  .set('Authorization', `Bearer ${token}`)
  .expect(200);
```

### Database Testing

```javascript
import db from '../utils/db.mjs';

// Setup test data
beforeAll(async () => {
  const result = await db.query(
    'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING id',
    ['testuser', 'test@example.com']
  );
  testUserId = result.rows[0].id;
});

// Cleanup
afterAll(async () => {
  if (testUserId) {
    await db.query('DELETE FROM users WHERE id = $1', [testUserId]);
  }
});
```

## Test Categories

### Unit Tests

ทดสอบฟังก์ชันหรือโมดูลโดยแยกส่วน ไม่พึ่งพา external dependencies

**Example**: `utils.test.mjs` - ทดสอบ email template utilities

### Integration Tests

ทดสอบการทำงานร่วมกันของหลาย components เช่น API endpoints กับ database

**Examples**:
- `auth.test.mjs` - Authentication API endpoints
- `userManagement.test.mjs` - User management API endpoints

## Best Practices

1. **Isolation**: แต่ละ test ควรเป็นอิสระจากกัน
2. **Cleanup**: ลบ test data หลัง test เสร็จ (ใช้ `afterAll` หรือ `afterEach`)
3. **Descriptive Names**: ใช้ชื่อ test ที่ชัดเจนว่า test อะไร
4. **AAA Pattern**: Arrange, Act, Assert
5. **Mock External Services**: Mock email, external APIs สำหรับ unit tests
6. **Test Data**: ใช้ unique test data (เช่น `Date.now()`) เพื่อหลีกเลี่ยง conflicts

## Coverage Goals

- **Statements**: > 70%
- **Branches**: > 70%
- **Functions**: > 70%
- **Lines**: > 70%

## Troubleshooting

### ES Modules Issues

หากเจอปัญหาเกี่ยวกับ ES modules:
- ตรวจสอบว่าไฟล์เป็น `.mjs`
- ใช้ `import` แทน `require`
- ใช้ `@jest/globals` สำหรับ Jest globals

### Database Connection Issues

- ตรวจสอบว่า database ทำงาน
- ตรวจสอบ environment variables ใน `.env`
- ใช้ test database แยกจาก production

### Timeout Issues

- เพิ่ม `jest.setTimeout()` ใน test file
- ตรวจสอบว่า `beforeAll`/`afterAll` cleanup ถูกต้อง

## CI/CD Integration

Tests ควรรันอัตโนมัติใน CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage
```

## Future Improvements

- [ ] เพิ่ม unit tests สำหรับ controllers
- [ ] เพิ่ม unit tests สำหรับ middleware
- [ ] เพิ่ม E2E tests
- [ ] เพิ่ม performance tests
- [ ] Mock external services (email, cloud storage)
- [ ] Test database fixtures/seeding
- [ ] Snapshot testing สำหรับ API responses

