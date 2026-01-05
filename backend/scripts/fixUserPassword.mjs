import bcrypt from 'bcrypt';
import { query } from '../utils/db.mjs';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script สำหรับแก้ไข password ของ user
 * ใช้เมื่อ password hash ในฐานข้อมูลไม่ถูกต้องหรือถูก truncate
 */

const fixUserPassword = async (email, newPassword) => {
  try {
    console.log(`[FIX PASSWORD] Starting password fix for: ${email}`);
    
    // ตรวจสอบว่า user มีอยู่หรือไม่
    const userResult = await query(
      'SELECT id, email, username FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.error(`[FIX PASSWORD] User not found: ${email}`);
      return { success: false, error: 'User not found' };
    }

    const user = userResult.rows[0];
    console.log(`[FIX PASSWORD] User found:`, { id: user.id, email: user.email, username: user.username });

    // เข้ารหัสรหัสผ่านใหม่
    console.log('[FIX PASSWORD] Hashing new password...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    console.log(`[FIX PASSWORD] Password hashed. Length: ${hashedPassword.length} characters`);

    // อัปเดตรหัสผ่านในฐานข้อมูล
    console.log('[FIX PASSWORD] Updating password in database...');
    await query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, user.id]
    );

    // ตรวจสอบว่า password ถูกบันทึกถูกต้องหรือไม่
    const verifyResult = await query(
      'SELECT password, LENGTH(password) as password_length FROM users WHERE id = $1',
      [user.id]
    );

    const savedPassword = verifyResult.rows[0].password;
    const passwordLength = verifyResult.rows[0].password_length;

    console.log(`[FIX PASSWORD] Password saved. Length: ${passwordLength} characters`);
    console.log(`[FIX PASSWORD] Password starts with: ${savedPassword.substring(0, 20)}...`);

    // ตรวจสอบว่า password ใหม่ทำงานได้หรือไม่
    const passwordMatch = await bcrypt.compare(newPassword, savedPassword);
    if (passwordMatch) {
      console.log('[FIX PASSWORD] ✅ Password verification successful!');
      return { 
        success: true, 
        message: 'Password has been updated successfully',
        userId: user.id,
        email: user.email
      };
    } else {
      console.error('[FIX PASSWORD] ❌ Password verification failed!');
      return { 
        success: false, 
        error: 'Password was saved but verification failed' 
      };
    }

  } catch (error) {
    console.error('[FIX PASSWORD] Error:', error);
    return { success: false, error: error.message };
  } finally {
    // ไม่ต้องปิด connection เพราะใช้ query helper ที่จัดการเอง
    process.exit(0);
  }
};

// รับ arguments จาก command line
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node fixUserPassword.mjs <email> <newPassword>');
  console.error('Example: node fixUserPassword.mjs sbeakjib@gmail.com MyNewPassword123');
  process.exit(1);
}

const [email, newPassword] = args;

// ตรวจสอบว่ารหัสผ่านมีความยาวเพียงพอ
if (newPassword.length < 6) {
  console.error('Error: Password must be at least 6 characters long');
  process.exit(1);
}

fixUserPassword(email, newPassword)
  .then(result => {
    if (result.success) {
      console.log('\n✅ Success:', result.message);
      console.log(`   User ID: ${result.userId}`);
      console.log(`   Email: ${result.email}`);
    } else {
      console.error('\n❌ Failed:', result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ Unexpected error:', error);
    process.exit(1);
  });

