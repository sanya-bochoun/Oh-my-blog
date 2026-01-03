# File Cleanup Documentation

## Overview

Script สำหรับ cleanup ไฟล์ใน `uploads/` directory เพื่อประหยัดพื้นที่และลบไฟล์ที่ไม่ได้ใช้

## Scripts

### Cleanup Old Files

ลบไฟล์ที่เก่ากว่าจำนวนวันที่กำหนด (default: 30 วัน)

```bash
npm run cleanup:uploads
```

หรือกำหนดจำนวนวันเอง:

```bash
node scripts/cleanupUploads.mjs old 60  # ลบไฟล์เก่ากว่า 60 วัน
```

### Cleanup Unused Files

ลบไฟล์ที่ไม่มีการอ้างอิงใน database

```bash
npm run cleanup:uploads:unused
```

หรือ:

```bash
node scripts/cleanupUploads.mjs unused
```

## Usage

### Manual Cleanup

```bash
# ลบไฟล์เก่ากว่า 30 วัน
node scripts/cleanupUploads.mjs old 30

# ลบไฟล์เก่ากว่า 7 วัน
node scripts/cleanupUploads.mjs old 7

# ลบไฟล์ที่ไม่ได้ใช้
node scripts/cleanupUploads.mjs unused
```

### Automated Cleanup

สามารถตั้งค่า cron job หรือ scheduled task สำหรับรัน cleanup อัตโนมัติ:

**Linux/Mac (cron):**
```bash
# รันทุกวันเวลา 2:00 AM
0 2 * * * cd /path/to/backend && node scripts/cleanupUploads.mjs old 30
```

**Windows (Task Scheduler):**
- สร้าง task ใหม่
- Action: `node scripts/cleanupUploads.mjs old 30`
- Schedule: Daily at 2:00 AM

**Node.js (node-cron):**
```javascript
import cron from 'node-cron';

// รันทุกวันเวลา 2:00 AM
cron.schedule('0 2 * * *', async () => {
  // Import and run cleanup
  const { cleanupOldFiles } = await import('./scripts/cleanupUploads.mjs');
  // ...
});
```

## Functions

### cleanupOldFiles(dirPath, daysOld)

ลบไฟล์ที่เก่ากว่าจำนวนวันที่กำหนด

**Parameters:**
- `dirPath` (string) - Path ของ directory
- `daysOld` (number) - จำนวนวัน (default: 30)

**Returns:**
- `{ deleted: number, totalSize: number }` - จำนวนไฟล์ที่ลบและขนาดรวม

### cleanupUnusedFiles(dirPath, checkFileInUse)

ลบไฟล์ที่ไม่มีการอ้างอิงใน database

**Parameters:**
- `dirPath` (string) - Path ของ directory
- `checkFileInUse` (Function) - Function สำหรับตรวจสอบว่าไฟล์ถูกใช้หรือไม่

**Returns:**
- `{ deleted: number, totalSize: number }` - จำนวนไฟล์ที่ลบและขนาดรวม

## Safety

- Script จะแสดงรายละเอียดไฟล์ที่ลบก่อนลบจริง
- ลบไฟล์แบบ recursive (รวม subdirectories)
- จัดการ errors อย่างปลอดภัย (ไม่หยุดทำงานเมื่อเจอ error)
- ตรวจสอบว่าไฟล์มีอยู่จริงก่อนลบ

## Examples

### Cleanup ไฟล์เก่ากว่า 30 วัน

```bash
npm run cleanup:uploads
```

Output:
```
Starting cleanup in /path/to/uploads...
Mode: old
Deleting files older than 30 days...
Deleted: /path/to/uploads/articles/image1.jpg (150.25 KB, 45.3 days old)
Deleted: /path/to/uploads/articles/image2.png (89.12 KB, 32.1 days old)

--- Cleanup Summary ---
Files deleted: 2
Total size freed: 0.23 MB
```

### Cleanup ไฟล์ที่ไม่ได้ใช้

```bash
npm run cleanup:uploads:unused
```

Output:
```
Starting cleanup in /path/to/uploads...
Mode: unused
Deleted unused file: /path/to/uploads/articles/unused-image.jpg (245.67 KB)

--- Cleanup Summary ---
Files deleted: 1
Total size freed: 0.24 MB
```

## Best Practices

1. **Backup First**: สำรองข้อมูลก่อนรัน cleanup
2. **Test First**: ทดสอบกับ test directory ก่อน
3. **Regular Cleanup**: รัน cleanup เป็นประจำ (weekly/monthly)
4. **Monitor Space**: ตรวจสอบพื้นที่ disk เป็นประจำ
5. **Log Results**: บันทึกผลลัพธ์ของ cleanup

## Integration

สามารถ integrate กับระบบอื่นได้:

- **Monitoring**: ส่ง notification เมื่อ cleanup เสร็จ
- **Logging**: บันทึก log ไปยัง logging system
- **Alerting**: แจ้งเตือนเมื่อลบไฟล์จำนวนมาก

## Future Improvements

- [ ] Dry-run mode (แสดงว่าจะลบอะไรแต่ไม่ลบจริง)
- [ ] Whitelist/blacklist files
- [ ] Archive old files แทนการลบ
- [ ] Integration กับ cloud storage cleanup
- [ ] Dashboard สำหรับดู statistics
- [ ] Email notification เมื่อ cleanup เสร็จ

