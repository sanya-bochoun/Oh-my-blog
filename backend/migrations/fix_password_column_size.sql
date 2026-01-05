-- Migration: fix_password_column_size.sql
-- เพิ่มขนาด password column เพื่อรองรับ bcrypt hash ที่มีความยาว 60 ตัวอักษร

-- เปลี่ยน password column จาก VARCHAR(100) เป็น VARCHAR(255)
ALTER TABLE users 
ALTER COLUMN password TYPE VARCHAR(255);

-- แสดงข้อความยืนยัน
DO $$
BEGIN
  RAISE NOTICE 'Password column size has been updated to VARCHAR(255)';
END $$;

