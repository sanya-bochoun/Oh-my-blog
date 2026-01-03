import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const ARTICLES_DIR = path.join(UPLOADS_DIR, 'articles');

/**
 * ลบไฟล์ที่เก่ากว่าจำนวนวันที่กำหนด
 * @param {string} dirPath - Path ของ directory
 * @param {number} daysOld - จำนวนวัน (default: 30)
 * @returns {Promise<{deleted: number, totalSize: number}>}
 */
async function cleanupOldFiles(dirPath, daysOld = 30) {
  let deletedCount = 0;
  let totalSize = 0;

  try {
    const files = await fs.readdir(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      
      try {
        const stats = await fs.stat(filePath);
        
        if (stats.isFile()) {
          const fileAgeInDays = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
          
          if (fileAgeInDays > daysOld) {
            await fs.unlink(filePath);
            deletedCount++;
            totalSize += stats.size;
            console.log(`Deleted: ${filePath} (${(stats.size / 1024).toFixed(2)} KB, ${fileAgeInDays.toFixed(1)} days old)`);
          }
        } else if (stats.isDirectory()) {
          // Recursive cleanup
          const result = await cleanupOldFiles(filePath, daysOld);
          deletedCount += result.deleted;
          totalSize += result.totalSize;
        }
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`Error reading directory ${dirPath}:`, error.message);
    }
  }

  return { deleted: deletedCount, totalSize };
}

/**
 * ลบไฟล์ที่ไม่มีการอ้างอิงใน database
 * @param {string} dirPath - Path ของ directory
 * @param {Function} checkFileInUse - Function สำหรับตรวจสอบว่าไฟล์ถูกใช้หรือไม่
 * @returns {Promise<{deleted: number, totalSize: number}>}
 */
async function cleanupUnusedFiles(dirPath, checkFileInUse) {
  let deletedCount = 0;
  let totalSize = 0;

  try {
    const files = await fs.readdir(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      
      try {
        const stats = await fs.stat(filePath);
        
        if (stats.isFile()) {
          const fileName = path.basename(filePath);
          const isInUse = await checkFileInUse(fileName);
          
          if (!isInUse) {
            await fs.unlink(filePath);
            deletedCount++;
            totalSize += stats.size;
            console.log(`Deleted unused file: ${filePath} (${(stats.size / 1024).toFixed(2)} KB)`);
          }
        } else if (stats.isDirectory()) {
          const result = await cleanupUnusedFiles(filePath, checkFileInUse);
          deletedCount += result.deleted;
          totalSize += result.totalSize;
        }
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`Error reading directory ${dirPath}:`, error.message);
    }
  }

  return { deleted: deletedCount, totalSize };
}

/**
 * ฟังก์ชันหลักสำหรับ cleanup
 */
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'old'; // 'old' หรือ 'unused'
  const daysOld = parseInt(args[1]) || 30;

  console.log(`Starting cleanup in ${UPLOADS_DIR}...`);
  console.log(`Mode: ${mode}`);
  
  if (mode === 'old') {
    console.log(`Deleting files older than ${daysOld} days...`);
  }

  try {
    let result;

    if (mode === 'old') {
      result = await cleanupOldFiles(UPLOADS_DIR, daysOld);
    } else if (mode === 'unused') {
      // Import db only when needed
      const db = (await import('../utils/db.mjs')).default;
      
      const checkFileInUse = async (fileName) => {
        // Check if file is referenced in articles table
        const result = await db.query(
          `SELECT COUNT(*) as count FROM articles 
           WHERE featured_image LIKE $1 OR content LIKE $1`,
          [`%${fileName}%`]
        );
        return parseInt(result.rows[0].count) > 0;
      };

      result = await cleanupUnusedFiles(UPLOADS_DIR, checkFileInUse);
    } else {
      console.error('Invalid mode. Use "old" or "unused"');
      process.exit(1);
    }

    console.log('\n--- Cleanup Summary ---');
    console.log(`Files deleted: ${result.deleted}`);
    console.log(`Total size freed: ${(result.totalSize / 1024 / 1024).toFixed(2)} MB`);
  } catch (error) {
    console.error('Cleanup error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { cleanupOldFiles, cleanupUnusedFiles };

