# Swagger/OpenAPI Documentation

## Overview

โปรเจกต์นี้ใช้ **Swagger (OpenAPI 3.0)** สำหรับ interactive API documentation

## Accessing the Documentation

หลังจากรัน server แล้ว สามารถเข้าถึง Swagger UI ได้ที่:

- **Development**: http://localhost:5000/api-docs
- **Production**: ปิดโดย default (ตั้ง `ENABLE_SWAGGER=true` เพื่อเปิด)

## Features

- **Interactive API Documentation**: ทดสอบ API ได้โดยตรงจาก browser
- **Schema Definitions**: ดู request/response schemas
- **Authentication**: รองรับ JWT Bearer token authentication
- **Try It Out**: ทดสอบ API endpoints ได้จริง

## Adding Documentation to Routes

### Basic Example

```javascript
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginController);
```

### With Authentication

```javascript
/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/profile', authenticateToken, getProfile);
```

### With Path Parameters

```javascript
/**
 * @swagger
 * /api/articles/{id}:
 *   get:
 *     summary: Get article by ID
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Article ID
 *     responses:
 *       200:
 *         description: Article found
 *       404:
 *         description: Article not found
 */
router.get('/:id', getArticleById);
```

### Using Schema References

Schemas ถูกกำหนดไว้ใน `backend/config/swagger.mjs`:

- `User`
- `Article`
- `RegisterRequest`
- `LoginRequest`
- `LoginResponse`
- `Error`
- `Success`

ใช้ schema reference:

```javascript
schema:
  $ref: '#/components/schemas/User'
```

## Authentication in Swagger UI

1. เปิด Swagger UI ที่ `/api-docs`
2. คลิกปุ่ม "Authorize" ที่ด้านบน
3. ใส่ JWT token ในรูปแบบ: `Bearer <your-token>`
4. คลิก "Authorize"
5. ทดสอบ endpoints ที่ต้องการ authentication

## Adding New Schemas

เพิ่ม schemas ใหม่ใน `backend/config/swagger.mjs`:

```javascript
components: {
  schemas: {
    YourNewSchema: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        // ... more properties
      },
    },
  },
}
```

## Configuration

### Environment Variables

- `API_URL`: Base URL สำหรับ API (default: http://localhost:5000)
- `ENABLE_SWAGGER`: เปิด Swagger ใน production (default: false)

### File Structure

- `backend/config/swagger.mjs`: Swagger configuration และ schemas
- Routes files: JSDoc comments สำหรับ endpoints

## Best Practices

1. **Document All Endpoints**: เพิ่ม documentation ให้ทุก endpoint

2. **Use Schema References**: ใช้ schema references แทน inline schemas

3. **Add Examples**: เพิ่ม examples ใน request/response schemas

4. **Document Error Responses**: ระบุ error responses ทุก endpoint

5. **Use Tags**: จัดกลุ่ม endpoints ด้วย tags

6. **Add Descriptions**: เพิ่ม description ที่ชัดเจน

## Testing with Swagger UI

1. เลือก endpoint ที่ต้องการทดสอบ
2. คลิก "Try it out"
3. กรอกข้อมูล request body/parameters
4. คลิก "Execute"
5. ดู response ที่ได้รับ

## Resources

- [Swagger/OpenAPI Specification](https://swagger.io/specification/)
- [swagger-jsdoc Documentation](https://github.com/Surnet/swagger-jsdoc)
- [swagger-ui-express Documentation](https://github.com/scottie1984/swagger-ui-express)

