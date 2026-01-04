import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_PASSWORD = process.env.DB_PASSWORD;

async function createBackup() {
  try {
    if (!DB_NAME || !DB_USER || !DB_PASSWORD) {
      throw new Error('Database credentials not found in environment variables');
    }

    // Create backup directory
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    console.log(`📁 Backup directory: ${BACKUP_DIR}`);

    const date = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupFile = path.join(BACKUP_DIR, `backup_${date}.sql`);

    console.log(`🔄 Creating backup...`);
    
    // Create backup using pg_dump
    const command = `PGPASSWORD="${DB_PASSWORD}" pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -F p > "${backupFile}"`;
    
    await execAsync(command);
    
    const stats = await fs.stat(backupFile);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`✅ Backup created successfully!`);
    console.log(`   File: ${backupFile}`);
    console.log(`   Size: ${fileSizeMB} MB`);

    // Cleanup old backups (keep last 30 days)
    console.log(`🧹 Cleaning up old backups...`);
    const files = await fs.readdir(BACKUP_DIR);
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const file of files) {
      if (file.startsWith('backup_') && file.endsWith('.sql')) {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = await fs.stat(filePath);
        if (stats.mtime.getTime() < thirtyDaysAgo) {
          await fs.unlink(filePath);
          deletedCount++;
          console.log(`   🗑️  Deleted old backup: ${file}`);
        }
      }
    }

    if (deletedCount > 0) {
      console.log(`   ✅ Cleaned up ${deletedCount} old backup(s)`);
    } else {
      console.log(`   ℹ️  No old backups to clean up`);
    }

    return backupFile;
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    if (error.stderr) {
      console.error('Error details:', error.stderr);
    }
    process.exit(1);
  }
}

// Run backup
createBackup();

