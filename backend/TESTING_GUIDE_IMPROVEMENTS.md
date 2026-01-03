# Testing Guide สำหรับ Improvements (ข้อ 11-13)

## ข้อ 11: Email Templates

### วิธีทดสอบ

#### 1. ตรวจสอบว่า Templates ถูกสร้างแล้ว
```powershell
# ตรวจสอบไฟล์ templates
cd backend
dir templates\emails
```

ควรเห็น:
- `verification-email.html`
- `reset-password-email.html`

#### 2. ทดสอบ Email Template Utils

สร้างไฟล์ทดสอบชั่วคราว:

```javascript
// test-email-template.mjs
import { loadAndRenderTemplate } from './utils/emailTemplate.mjs';

async function test() {
  try {
    // ทดสอบ verification email
    const verificationHtml = await loadAndRenderTemplate('verification-email', {
      verifyUrl: 'https://example.com/verify?token=test123'
    });
    
    console.log('✓ Verification email template loaded');
    console.log('Contains verifyUrl:', verificationHtml.includes('test123'));
    console.log('No placeholders:', !verificationHtml.includes('{{'));
    
    // ทดสอบ reset password email
    const resetHtml = await loadAndRenderTemplate('reset-password-email', {
      resetUrl: 'https://example.com/reset?token=test456'
    });
    
    console.log('✓ Reset password email template loaded');
    console.log('Contains resetUrl:', resetHtml.includes('test456'));
    console.log('No placeholders:', !resetHtml.includes('{{'));
    
    console.log('\n✅ All email templates working correctly!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
```

รันทดสอบ:
```powershell
cd backend
node test-email-template.mjs
```

#### 3. ทดสอบ Email Sending (จริง)

ใช้ API endpoint สำหรับ register หรือ forgot password:

```powershell
# ทดสอบ register (จะส่ง verification email)
$body = @{
    username = "testuser$(Get-Date -Format 'yyyyMMddHHmmss')"
    email = "test$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
    password = "Test1234!"
    full_name = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

ตรวจสอบ email inbox ว่ามี email ส่งมาและ format ถูกต้อง

---

## ข้อ 12: Test Suite

### 1. ติดตั้ง Dependencies

```powershell
cd backend
npm install --save-dev jest @jest/globals supertest
```

### 2. ตรวจสอบ Test Configuration

```powershell
# ตรวจสอบว่า jest.config.mjs มีอยู่
cd backend
Test-Path jest.config.mjs
```

### 3. รัน Tests

```powershell
cd backend

# รัน tests ทั้งหมด
npm test

# รัน tests ใน watch mode
npm run test:watch

# รัน tests พร้อม coverage
npm run test:coverage
```

### 4. ทดสอบ Unit Tests (Utils)

```powershell
cd backend
npm test -- utils.test.mjs
```

ควรเห็นผลลัพธ์:
```
 PASS  __tests__/utils.test.mjs
  Email Template Utils
    renderTemplate
      ✓ should replace placeholders correctly
      ✓ should handle multiple occurrences
      ✓ should handle empty variables object
    loadAndRenderTemplate
      ✓ should load and render verification email template
      ✓ should load and render reset password email template
      ✓ should throw error for non-existent template
```

### 5. ทดสอบ Integration Tests (Auth)

**หมายเหตุ**: ต้องมี database running และตั้งค่า .env ก่อน

```powershell
cd backend
npm test -- auth.test.mjs
```

### 6. ตรวจสอบ Test Coverage

```powershell
cd backend
npm run test:coverage
```

เปิดไฟล์ `coverage/index.html` ใน browser เพื่อดู coverage report

---

## ข้อ 13: File Cleanup Script

### 1. ตรวจสอบ Script

```powershell
cd backend
Test-Path scripts\cleanupUploads.mjs
```

### 2. ทดสอบ Dry Run (ดูว่ามีไฟล์อะไรบ้าง)

ก่อนรัน cleanup จริง ควรดูว่ามีไฟล์อะไรบ้าง:

```powershell
cd backend
Get-ChildItem -Path uploads -Recurse -File | 
    Select-Object FullName, Length, LastWriteTime | 
    Format-Table -AutoSize
```

### 3. ทดสอบ Cleanup ไฟล์เก่า (Safe Test)

ทดสอบกับวันที่เก่ามากๆ ก่อน (เช่น 365 วัน) เพื่อให้แน่ใจว่าไม่ลบไฟล์ที่ยังใช้:

```powershell
cd backend
node scripts/cleanupUploads.mjs old 365
```

ควรเห็น output แบบนี้:
```
Starting cleanup in C:\Users\...\backend\uploads...
Mode: old
Deleting files older than 365 days...

--- Cleanup Summary ---
Files deleted: X
Total size freed: X.XX MB
```

### 4. ทดสอบ Cleanup Unused Files

**คำเตือน**: ต้องมี database connection ที่ทำงาน

```powershell
cd backend
node scripts/cleanupUploads.mjs unused
```

### 5. ตรวจสอบ Scripts ใน package.json

```powershell
cd backend
npm run cleanup:uploads
npm run cleanup:uploads:unused
```

---

## Quick Test Script

สร้างไฟล์ทดสอบแบบรวม:

```javascript
// quick-test.mjs
import { loadAndRenderTemplate } from './utils/emailTemplate.mjs';
import fs from 'fs/promises';
import path from 'path';

console.log('🧪 Running Quick Tests...\n');

// Test 1: Email Templates
console.log('1. Testing Email Templates...');
try {
  const html = await loadAndRenderTemplate('verification-email', {
    verifyUrl: 'https://test.com/verify?token=test'
  });
  if (html.includes('test.com') && !html.includes('{{')) {
    console.log('   ✅ Email templates working');
  } else {
    console.log('   ❌ Email templates failed');
  }
} catch (error) {
  console.log('   ❌ Email templates error:', error.message);
}

// Test 2: Cleanup Script
console.log('\n2. Testing Cleanup Script...');
try {
  const scriptPath = path.join(process.cwd(), 'scripts', 'cleanupUploads.mjs');
  await fs.access(scriptPath);
  console.log('   ✅ Cleanup script exists');
} catch (error) {
  console.log('   ❌ Cleanup script not found');
}

// Test 3: Jest Config
console.log('\n3. Testing Jest Configuration...');
try {
  const jestPath = path.join(process.cwd(), 'jest.config.mjs');
  await fs.access(jestPath);
  console.log('   ✅ Jest config exists');
} catch (error) {
  console.log('   ❌ Jest config not found');
}

console.log('\n✅ Quick tests completed!');
```

รัน:
```powershell
cd backend
node quick-test.mjs
```

---

## สรุป Checklist

- [ ] Email templates ถูกสร้าง (`templates/emails/*.html`)
- [ ] Email template utils ทำงาน (`utils/emailTemplate.mjs`)
- [ ] Jest ติดตั้งแล้ว (`npm list jest`)
- [ ] Jest config มีอยู่ (`jest.config.mjs`)
- [ ] Test files มีอยู่ (`__tests__/*.test.mjs`)
- [ ] Tests รันได้ (`npm test`)
- [ ] Cleanup script มีอยู่ (`scripts/cleanupUploads.mjs`)
- [ ] Cleanup script ทำงาน (`node scripts/cleanupUploads.mjs old 365`)

