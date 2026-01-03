# วิธีแก้ปัญหา Email Verification

## ปัญหา
Token verification ไม่ทำงาน แสดง error "Verification link is invalid or has expired"

## สาเหตุที่เป็นไปได้
1. **Column `token` ใน database มีขนาดเล็กเกินไป** (`VARCHAR(100)` ไม่พอสำหรับ token 64 ตัวอักษร)
2. **Migration ยังไม่ถูกรัน**

## วิธีแก้ไข

### วิธีที่ 1: รัน Migration (แนะนำ)

```bash
cd backend
npm run migrate
```

Migration จะแก้ไข column `token` จาก `VARCHAR(100)` เป็น `VARCHAR(255)` อัตโนมัติ

### วิธีที่ 2: แก้ไขด้วย SQL โดยตรง

1. เชื่อมต่อ PostgreSQL:
```bash
psql -U postgres -d my_blog_db
```

2. รันคำสั่ง SQL:
```sql
ALTER TABLE verification_tokens 
ALTER COLUMN token TYPE VARCHAR(255);
```

3. ตรวจสอบว่าแก้ไขสำเร็จ:
```sql
SELECT 
    column_name, 
    data_type, 
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'verification_tokens' 
  AND column_name = 'token';
```

ควรเห็น `character_maximum_length = 255`

### วิธีที่ 3: ใช้ Script ที่เตรียมไว้

```bash
cd backend
psql -U postgres -d my_blog_db -f scripts/fix_verification_token.sql
```

## ตรวจสอบว่าแก้ไขสำเร็จ

1. **ตรวจสอบ Column Type:**
```sql
SELECT 
    column_name, 
    data_type, 
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'verification_tokens' 
  AND column_name = 'token';
```

2. **ตรวจสอบ Token ที่บันทึก:**
```sql
SELECT 
    id,
    user_id,
    LEFT(token, 20) || '...' as token_preview,
    LENGTH(token) as token_length,
    type,
    expires_at
FROM verification_tokens
WHERE type = 'email_verification'
ORDER BY created_at DESC
LIMIT 5;
```

`token_length` ควรเป็น **64** สำหรับ token ใหม่

3. **ทดสอบสมัคร User ใหม่:**
   - สมัคร user ใหม่
   - ตรวจสอบ backend console logs:
     - `[REGISTER] Token length: 64`
     - `[REGISTER] Token saved to database: { tokenLength: 64 }`
   - เปิด email และคลิก verification link
   - ตรวจสอบ logs:
     - `[VERIFY_EMAIL] Full token length: 64`
     - `[VERIFY_EMAIL] Token exists check: { found: true }`

## ถ้ายังมีปัญหา

1. **ตรวจสอบ Backend Console Logs:**
   - ดูว่า token ถูกบันทึกหรือไม่
   - ดูว่า token length ถูกต้องหรือไม่ (ควรเป็น 64)
   - ดูว่า query หา token เจอหรือไม่

2. **ตรวจสอบ Database:**
   - ตรวจสอบว่า column type ถูกต้อง (`VARCHAR(255)`)
   - ตรวจสอบว่า token ถูกบันทึกครบ 64 ตัวอักษร
   - ตรวจสอบว่า token หมดอายุหรือไม่

3. **ลบ Token เก่าที่อาจถูก Truncate:**
```sql
-- ลบ token เก่าทั้งหมด (ถ้าจำเป็น)
DELETE FROM verification_tokens WHERE type = 'email_verification';

-- สมัคร user ใหม่เพื่อสร้าง token ใหม่
```

## หมายเหตุ

- Token ใหม่ที่สร้างหลังจากแก้ไข column จะทำงานได้ปกติ
- Token เก่าที่ถูก truncate แล้วจะใช้ไม่ได้ ต้องสมัครใหม่หรือใช้ "Resend Verification Email"

