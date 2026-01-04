# วิธีทดสอบ Improvements (ข้อ 11-13)

## 📋 สรุปวิธีทดสอบ

### ข้อ 11: Email Templates

#### วิธีที่ 1: รัน Script ทดสอบ (แนะนำ)

```powershell
cd backend
node test-improvements.mjs
```

จะแสดงผลว่า email templates ทำงานถูกต้องหรือไม่

#### วิธีที่ 2: ทดสอบด้วย API (จริง)

1. เริ่ม server:
```powershell
cd backend
npm run dev
```

2. ทดสอบ register (จะส่ง verification email):
```powershell
$body = @{
    username = "testuser$(Get-Date -Format 'yyyyMMddHHmmss')"
    email = "your-email@example.com"  # ใส่ email จริง
    password = "Test1234!"
    full_name = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

3. ตรวจสอบ email inbox ว่ามี email ส่งมาและ format ถูกต้อง

---

### ข้อ 12: Test Suite

#### ขั้นตอนที่ 1: ติดตั้ง Dependencies

```powershell
cd backend
npm install --save-dev jest @jest/globals supertest
```

#### ขั้นตอนที่ 2: รัน Tests

```powershell
# รัน tests ทั้งหมด
npm test

# รัน tests พร้อม coverage
npm run test:coverage

# รัน tests ใน watch mode (auto-rerun เมื่อแก้ไฟล์)
npm run test:watch
```

#### ขั้นตอนที่ 3: ตรวจสอบผลลัพธ์

ควรเห็น output แบบนี้:
```
 PASS  __tests__/utils.test.mjs
  Email Template Utils
    renderTemplate
      ✓ should replace placeholders correctly
      ✓ should handle multiple occurrences
      ...

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
```

---

### ข้อ 13: File Cleanup Script

#### วิธีที่ 1: ทดสอบแบบ Safe (แนะนำ)

ทดสอบกับวันที่เก่ามากๆ ก่อน (365 วัน) เพื่อให้แน่ใจว่าไม่ลบไฟล์ที่ยังใช้:

```powershell
cd backend
node scripts/cleanupUploads.mjs old 365
```

ควรเห็น output:
```
Starting cleanup in C:\Users\...\backend\uploads...
Mode: old
Deleting files older than 365 days...

--- Cleanup Summary ---
Files deleted: X
Total size freed: X.XX MB
```

#### วิธีที่ 2: ใช้ npm script

```powershell
cd backend

# ลบไฟล์เก่ากว่า 30 วัน
npm run cleanup:uploads

# ลบไฟล์ที่ไม่ได้ใช้ (ต้องมี database connection)
npm run cleanup:uploads:unused
```

#### วิธีที่ 3: ดูไฟล์ที่มีอยู่ก่อน

ก่อนรัน cleanup ควรดูว่ามีไฟล์อะไรบ้าง:

```powershell
cd backend
Get-ChildItem -Path uploads -Recurse -File | 
    Select-Object FullName, @{Name="SizeKB";Expression={[math]::Round($_.Length/1KB,2)}}, LastWriteTime | 
    Format-Table -AutoSize
```

---

## ✅ Quick Test (แบบรวดเร็ว)

รัน script เดียวเพื่อทดสอบทุกอย่าง:

```powershell
cd backend
node test-improvements.mjs
```

จะแสดงผล:
- ✅ Email templates ทำงาน
- ✅ Test files มีอยู่
- ✅ Cleanup script มีอยู่
- ✅ Package.json scripts ถูกต้อง

---

## 🔍 ตรวจสอบด้วยมือ

### 1. ตรวจสอบไฟล์ที่สร้าง

```powershell
cd backend

# Email templates
dir templates\emails

# Test files
dir __tests__

# Cleanup script
dir scripts\cleanupUploads.mjs

# Jest config
dir jest.config.mjs
```

### 2. ตรวจสอบ package.json

```powershell
cd backend
Get-Content package.json | Select-String -Pattern "test|cleanup" -Context 2
```

ควรเห็น scripts:
- `"test"`
- `"test:watch"`
- `"test:coverage"`
- `"cleanup:uploads"`
- `"cleanup:uploads:unused"`

---

## ⚠️ สิ่งที่ต้องเตรียม

### สำหรับ Test Suite (ข้อ 12):
- ✅ ติดตั้ง Jest: `npm install --save-dev jest @jest/globals supertest`
- ✅ Database ต้อง running (สำหรับ integration tests)
- ✅ `.env` file ตั้งค่าถูกต้อง

### สำหรับ Cleanup Script (ข้อ 13):
- ✅ Database connection (สำหรับ unused files cleanup)
- ✅ ไฟล์ใน `uploads/` directory (สำหรับทดสอบ)

### สำหรับ Email Templates (ข้อ 11):
- ✅ Email configuration ใน `.env` (EMAIL_HOST, EMAIL_USER, etc.)
- ✅ หรือทดสอบด้วย test script (ไม่ต้องส่ง email จริง)

---

## 📝 Checklist

- [ ] Email templates ถูกสร้าง (`templates/emails/*.html`)
- [ ] Email template utils ทำงาน (รัน `node test-improvements.mjs`)
- [ ] Jest config มีอยู่ (`jest.config.mjs`)
- [ ] Test files มีอยู่ (`__tests__/*.test.mjs`)
- [ ] Jest ติดตั้งแล้ว (`npm list jest`)
- [ ] Tests รันได้ (`npm test`)
- [ ] Cleanup script มีอยู่ (`scripts/cleanupUploads.mjs`)
- [ ] Cleanup script ทำงาน (`node scripts/cleanupUploads.mjs old 365`)
- [ ] Package.json scripts อัพเดตแล้ว

---

## 🎯 Next Steps

หลังจากทดสอบเสร็จ:

1. **Email Templates**: แก้ไข HTML templates ได้ตามต้องการใน `templates/emails/`
2. **Test Suite**: เพิ่ม tests ใหม่ใน `__tests__/` เมื่อมี features ใหม่
3. **Cleanup Script**: ตั้งค่า cron job หรือ scheduled task สำหรับรัน cleanup อัตโนมัติ

