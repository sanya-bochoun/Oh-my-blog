# คู่มือการทดสอบ Improvements ที่ทำ

คู่มือนี้แนะนำวิธีการทดสอบการปรับปรุงที่ทำไปทั้ง 5 ข้อ

---

## ข้อ 1: Email Verification

### ทดสอบ Registration + Email Verification

1. **ทดสอบ Registration:**
   ```bash
   # Start backend server
   cd backend
   npm run dev
   ```

   - ไปที่หน้า Sign Up
   - สมัคร account ใหม่
   - ตรวจสอบว่าได้รับ email verification

2. **ทดสอบ Email Verification:**
   - เปิด email ที่ได้รับ
   - คลิก link ใน email หรือ copy token มา
   - ไปที่: `http://localhost:5173/verify-email/{token}`
   - หรือเรียก API: `GET /api/auth/verify-email/{token}`
   - ตรวจสอบว่า verify สำเร็จ

3. **ทดสอบ Resend Verification Email:**
   ```bash
   # API Call
   POST /api/auth/resend-verification
   Body: { "email": "test@example.com" }
   ```
   - ตรวจสอบว่าได้รับ email ใหม่

### ทดสอบด้วย API:

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test1234",
    "full_name": "Test User"
  }'

# 2. Check email for verification token

# 3. Verify email (ใช้ token จาก email)
curl -X GET http://localhost:5000/api/auth/verify-email/{token}

# 4. Resend verification email
curl -X POST http://localhost:5000/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

---

## ข้อ 2: Password Strength Validation

### ทดสอบ Password Requirements

ทดสอบด้วย API หรือ Frontend:

```bash
# ❌ Test 1: Password น้อยกว่า 8 ตัวอักษร (ควร fail)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "test2@example.com",
    "password": "Test12",
    "full_name": "Test User"
  }'
# Expected: Error "Password must be at least 8 characters long"

# ❌ Test 2: Password ไม่มีตัวพิมพ์ใหญ่ (ควร fail)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser3",
    "email": "test3@example.com",
    "password": "test1234",
    "full_name": "Test User"
  }'
# Expected: Error "Password must contain at least one uppercase letter..."

# ❌ Test 3: Password ไม่มีตัวพิมพ์เล็ก (ควร fail)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser4",
    "email": "test4@example.com",
    "password": "TEST1234",
    "full_name": "Test User"
  }'
# Expected: Error "Password must contain at least one lowercase letter..."

# ❌ Test 4: Password ไม่มีตัวเลข (ควร fail)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser5",
    "email": "test5@example.com",
    "password": "TestPassword",
    "full_name": "Test User"
  }'
# Expected: Error "Password must contain at least one number"

# ✅ Test 5: Password ถูกต้อง (ควรผ่าน)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser6",
    "email": "test6@example.com",
    "password": "Test1234",
    "full_name": "Test User"
  }'
# Expected: Success
```

### ทดสอบ Reset Password:

```bash
# ❌ Test: Password ใหม่ไม่ตรงตาม requirements
curl -X POST http://localhost:5000/api/auth/reset-password/{token} \
  -H "Content-Type: application/json" \
  -d '{"password": "weak"}'
# Expected: Error

# ✅ Test: Password ใหม่ถูกต้อง
curl -X POST http://localhost:5000/api/auth/reset-password/{token} \
  -H "Content-Type: application/json" \
  -d '{"password": "NewPass123"}'
# Expected: Success
```

---

## ข้อ 3: Frontend URL (Environment Variable)

### ทดสอบ:

1. **ตรวจสอบว่าใช้ environment variable:**
   - เปิดไฟล์ `backend/config/email.mjs`
   - ตรวจสอบว่าใช้ `process.env.FRONTEND_URL || 'http://localhost:5173'`

2. **ทดสอบเปลี่ยน FRONTEND_URL:**
   ```bash
   # ใน backend/.env file
   FRONTEND_URL=http://localhost:3000
   ```
   - Restart backend server
   - Register account ใหม่
   - ตรวจสอบว่า link ใน email ใช้ URL ที่ตั้งไว้

3. **ทดสอบใน Production:**
   - Set `FRONTEND_URL=https://yourdomain.com` ใน production environment
   - ตรวจสอบว่า email links ใช้ production URL

---

## ข้อ 4: Rate Limiting สำหรับ Auth Routes

### ทดสอบ Rate Limiting:

```bash
# Test 1: Login Rate Limiting (5 attempts per 15 minutes)
# ทำการ login ผิด 6 ครั้งติดกัน:

for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "wrong@example.com", "password": "wrong"}'
  echo "Attempt $i"
done
# Expected: ครั้งที่ 6 ควรได้ 429 Too Many Requests

# Test 2: Register Rate Limiting (3 attempts per hour)
for i in {1..4}; do
  curl -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{
      \"username\": \"test$i\",
      \"email\": \"test$i@example.com\",
      \"password\": \"Test1234\",
      \"full_name\": \"Test User\"
    }"
  echo "Attempt $i"
done
# Expected: ครั้งที่ 4 ควรได้ 429 Too Many Requests

# Test 3: Forgot Password Rate Limiting (3 attempts per hour)
for i in {1..4}; do
  curl -X POST http://localhost:5000/api/auth/forgot-password \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"test$i@example.com\"}"
  echo "Attempt $i"
done
# Expected: ครั้งที่ 4 ควรได้ 429 Too Many Requests
```

### ทดสอบด้วย Browser:

1. เปิด DevTools → Network tab
2. พยายาม login ผิด 6 ครั้งติดกัน
3. ตรวจสอบ response code 429 ในครั้งที่ 6
4. ตรวจสอบ error message: "Too many login attempts, please try again after 15 minutes"

---

## ข้อ 5: Environment Variables Validation

### ทดสอบ:

1. **ทดสอบ Missing Required Variables:**
   ```bash
   # ลบ DATABASE_URL หรือ JWT_SECRET จาก .env
   # หรือสร้าง .env ใหม่ที่ไม่มี required vars
   
   cd backend
   npm run dev
   ```
   - Expected: Server จะไม่ start และแสดง error message
   - Expected: แสดงรายการ missing variables

2. **ทดสอบ JWT_SECRET ที่สั้นเกินไป:**
   ```bash
   # ใน .env
   JWT_SECRET=short
   ```
   - Start server
   - Expected: แสดง warning แต่ server ยัง start ได้

3. **ทดสอบ Incomplete Email Configuration:**
   ```bash
   # ใน .env - มีแค่ EMAIL_HOST แต่ไม่มี EMAIL_USER, EMAIL_PASS
   EMAIL_HOST=smtp.gmail.com
   # ลบ EMAIL_USER และ EMAIL_PASS
   ```
   - Start server
   - Expected: แสดง warning แต่ server ยัง start ได้

4. **ทดสอบ Complete Configuration:**
   ```bash
   # Set all required variables
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-long-secret-key-at-least-32-characters
   ```
   - Start server
   - Expected: Server start ปกติ ไม่มี error หรือ warning

---

## การทดสอบแบบ Manual (Frontend)

### 1. Email Verification:
1. ไปหน้า Sign Up
2. สมัคร account
3. ตรวจสอบ email inbox
4. คลิก verification link
5. ตรวจสอบว่า verify สำเร็จ

### 2. Password Strength:
1. ไปหน้า Sign Up
2. พยายามสมัครด้วย password ที่ไม่ตรงตาม requirements:
   - น้อยกว่า 8 ตัวอักษร
   - ไม่มีตัวพิมพ์ใหญ่
   - ไม่มีตัวพิมพ์เล็ก
   - ไม่มีตัวเลข
3. ตรวจสอบว่าแสดง error message ที่ถูกต้อง
4. สมัครด้วย password ที่ถูกต้อง: `Test1234`

### 3. Rate Limiting:
1. ไปหน้า Login
2. พยายาม login ผิด 6 ครั้งติดกัน
3. ครั้งที่ 6 ควรแสดง error "Too many login attempts"
4. รอ 15 นาที แล้วลองใหม่

---

## การทดสอบด้วย Automated Tests (Optional)

ถ้าต้องการสร้าง automated tests:

```javascript
// Example test structure (ยังไม่ได้ implement)
describe('Email Verification', () => {
  it('should send verification email on registration', async () => {
    // Test implementation
  });
  
  it('should verify email with valid token', async () => {
    // Test implementation
  });
});

describe('Password Strength', () => {
  it('should reject password less than 8 characters', async () => {
    // Test implementation
  });
  
  it('should reject password without uppercase', async () => {
    // Test implementation
  });
});

describe('Rate Limiting', () => {
  it('should limit login attempts to 5 per 15 minutes', async () => {
    // Test implementation
  });
});
```

---

## Checklist การทดสอบ

### Email Verification:
- [ ] Registration ส่ง verification email
- [ ] Verification link ใช้งานได้
- [ ] Verify สำเร็จแล้วไม่สามารถ verify ซ้ำได้
- [ ] Resend verification email ใช้งานได้
- [ ] Token หมดอายุแล้วใช้ไม่ได้

### Password Strength:
- [ ] Reject password < 8 characters
- [ ] Reject password without uppercase
- [ ] Reject password without lowercase
- [ ] Reject password without number
- [ ] Accept valid password (Test1234)
- [ ] ใช้ได้กับ register, reset password, change password

### Frontend URL:
- [ ] ใช้ FRONTEND_URL จาก env variable
- [ ] มี fallback เป็น localhost:5173
- [ ] Email links ใช้ URL ที่ถูกต้อง

### Rate Limiting:
- [ ] Login limited to 5 per 15 min
- [ ] Register limited to 3 per hour
- [ ] Forgot password limited to 3 per hour
- [ ] Error message ชัดเจน
- [ ] HTTP status 429

### Environment Variables:
- [ ] Server ไม่ start ถ้า missing required vars
- [ ] Warning สำหรับ JWT_SECRET สั้นเกินไป
- [ ] Warning สำหรับ incomplete email config
- [ ] Warning สำหรับ incomplete Cloudinary config

---

## Tips:

1. **ใช้ Postman หรือ Insomnia** สำหรับทดสอบ API
2. **ใช้ Browser DevTools** ดู Network requests และ responses
3. **ตรวจสอบ Console logs** ใน backend terminal
4. **ตรวจสอบ Email inbox** สำหรับ verification/reset emails
5. **ใช้ dummy email** สำหรับทดสอบ (ไม่ต้อง verify จริง)

