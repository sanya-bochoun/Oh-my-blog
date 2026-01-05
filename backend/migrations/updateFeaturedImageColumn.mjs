import { query } from '../utils/db.mjs';

const migration = async () => {
  try {
    // ตรวจสอบว่า column featured_image มีอยู่หรือไม่
    const checkColumn = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'posts' AND column_name = 'featured_image';
    `);
    
    if (checkColumn.rows.length > 0) {
      // Rename column featured_image to thumbnail_url
      await query(`
        ALTER TABLE posts 
        RENAME COLUMN featured_image TO thumbnail_url;
      `);
      console.log('✅ Successfully renamed featured_image column to thumbnail_url');
    } else {
      // ตรวจสอบว่า thumbnail_url มีอยู่แล้วหรือไม่
      const checkThumbnail = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'thumbnail_url';
      `);
      
      if (checkThumbnail.rows.length > 0) {
        console.log('✅ Column thumbnail_url already exists');
      } else {
        // ถ้าไม่มีทั้งสอง column ให้สร้างใหม่
        await query(`
          ALTER TABLE posts 
          ADD COLUMN thumbnail_url VARCHAR(255);
        `);
        console.log('✅ Successfully added thumbnail_url column');
      }
    }
  } catch (error) {
    console.error('❌ Error running migration:', error);
    throw error;
  } finally {
    // ปิด connection pool
    process.exit(0);
  }
};

migration().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
}); 