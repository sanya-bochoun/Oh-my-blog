# Database Backup Strategy

## Overview
เอกสารนี้อธิบาย strategy สำหรับการ backup database ของ Oh!myBlog application

## Database Information
- **Database Type**: PostgreSQL
- **Connection**: ใช้ pg (node-postgres) library
- **Environment Variables**: 
  - `DB_HOST`
  - `DB_PORT`
  - `DB_NAME`
  - `DB_USER`
  - `DB_PASSWORD`

## Backup Strategies

### 1. Automated Daily Backups

#### Option A: PostgreSQL pg_dump (Recommended)
ใช้ `pg_dump` command เพื่อสร้าง SQL dump file

**Script Example** (`scripts/backup.sh`):
```bash
#!/bin/bash

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="${DB_NAME:-ohmyblog}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  --format=custom \
  --file="$BACKUP_DIR/backup_$DATE.dump"

# Compress backup
gzip "$BACKUP_DIR/backup_$DATE.dump"

# Keep only last 30 days of backups
find "$BACKUP_DIR" -name "backup_*.dump.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.dump.gz"
```

**Windows PowerShell Script** (`scripts/backup.ps1`):
```powershell
# Configuration
$BACKUP_DIR = ".\backups"
$DATE = Get-Date -Format "yyyyMMdd_HHmmss"
$DB_NAME = $env:DB_NAME
$DB_USER = $env:DB_USER
$DB_HOST = $env:DB_HOST
$DB_PORT = $env:DB_PORT

# Create backup directory
New-Item -ItemType Directory -Force -Path $BACKUP_DIR

# Create backup
$env:PGPASSWORD = $env:DB_PASSWORD
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME `
  --format=custom `
  --file="$BACKUP_DIR\backup_$DATE.dump"

# Compress backup
Compress-Archive -Path "$BACKUP_DIR\backup_$DATE.dump" -DestinationPath "$BACKUP_DIR\backup_$DATE.dump.zip" -Force
Remove-Item "$BACKUP_DIR\backup_$DATE.dump"

# Keep only last 30 days
Get-ChildItem -Path $BACKUP_DIR -Filter "backup_*.dump.zip" | 
  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | 
  Remove-Item

Write-Host "Backup completed: backup_$DATE.dump.zip"
```

#### Option B: Node.js Backup Script
ใช้ Node.js script สำหรับ backup (`scripts/backupDb.mjs`):

```javascript
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;

async function createBackup() {
  try {
    // Create backup directory
    await fs.mkdir(BACKUP_DIR, { recursive: true });

    const date = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupFile = path.join(BACKUP_DIR, `backup_${date}.sql`);

    // Create backup
    const command = `PGPASSWORD="${process.env.DB_PASSWORD}" pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} > "${backupFile}"`;
    
    await execAsync(command);
    console.log(`✅ Backup created: ${backupFile}`);

    // Cleanup old backups (keep last 30 days)
    const files = await fs.readdir(BACKUP_DIR);
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    for (const file of files) {
      if (file.startsWith('backup_') && file.endsWith('.sql')) {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = await fs.stat(filePath);
        if (stats.mtime.getTime() < thirtyDaysAgo) {
          await fs.unlink(filePath);
          console.log(`🗑️  Deleted old backup: ${file}`);
        }
      }
    }

    return backupFile;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

createBackup();
```

### 2. Manual Backup Commands

#### Full Database Backup
```bash
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > backup.sql
```

#### Custom Format (Compressed)
```bash
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -Fc -f backup.dump
```

#### Restore from Backup
```bash
# From SQL file
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < backup.sql

# From custom format
pg_restore -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME backup.dump
```

### 3. Cloud Backup Solutions

#### Option A: AWS RDS Automated Backups
ถ้าใช้ AWS RDS:
- เปิดใช้งาน automated backups
- Retention period: 7-35 days
- Point-in-time recovery available

#### Option B: Google Cloud SQL
ถ้าใช้ Google Cloud SQL:
- เปิดใช้งาน automated backups
- Retention period: configurable
- Point-in-time recovery available

#### Option C: Manual Cloud Storage Upload
อัปโหลด backup files ไปยัง cloud storage:

**AWS S3 Example**:
```bash
aws s3 cp backup.dump s3://your-bucket/backups/backup_$(date +%Y%m%d).dump
```

**Google Cloud Storage Example**:
```bash
gsutil cp backup.dump gs://your-bucket/backups/backup_$(date +%Y%m%d).dump
```

### 4. Backup Schedule Recommendations

#### Development Environment
- **Frequency**: Weekly
- **Retention**: 4 weeks
- **Method**: Manual or scheduled script

#### Production Environment
- **Frequency**: Daily (automated)
- **Retention**: 30 days minimum
- **Method**: Automated script + cloud storage
- **Point-in-time Recovery**: Recommended

### 5. Backup Verification

#### Verify Backup File
```bash
# Check if backup file is valid
pg_restore --list backup.dump
```

#### Test Restore (on test database)
```bash
# Create test database
createdb test_restore

# Restore to test database
pg_restore -d test_restore backup.dump

# Verify data
psql -d test_restore -c "SELECT COUNT(*) FROM posts;"
```

### 6. Disaster Recovery Plan

#### Recovery Steps
1. **Identify the issue**: Determine what data was lost
2. **Choose backup**: Select the most recent valid backup
3. **Create new database** (if needed):
   ```bash
   createdb ohmyblog_restored
   ```
4. **Restore backup**:
   ```bash
   pg_restore -d ohmyblog_restored backup.dump
   ```
5. **Verify data**: Check critical tables and data
6. **Update application**: Point application to restored database
7. **Test functionality**: Ensure all features work correctly

### 7. Backup Script Setup

#### Add to package.json
```json
{
  "scripts": {
    "backup": "node scripts/backupDb.mjs",
    "backup:restore": "node scripts/restoreDb.mjs"
  }
}
```

#### Cron Job Setup (Linux/Mac)
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/backend && npm run backup
```

#### Windows Task Scheduler
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: Daily at 2:00 AM
4. Action: Start a program
5. Program: `node`
6. Arguments: `scripts/backupDb.mjs`
7. Start in: `C:\path\to\backend`

### 8. Monitoring and Alerts

#### Backup Success/Failure Notification
- Email notification on backup completion
- Alert on backup failure
- Log backup status to monitoring system

#### Backup Size Monitoring
- Monitor backup file sizes
- Alert if backup size changes significantly (possible data loss or corruption)

### 9. Security Considerations

1. **Backup File Encryption**: Encrypt sensitive backup files
2. **Access Control**: Restrict access to backup files
3. **Secure Storage**: Store backups in secure location
4. **Password Protection**: Use strong passwords for database
5. **Network Security**: Use secure connections for backup operations

### 10. Best Practices

1. **Test Restores Regularly**: Test restore process monthly
2. **Multiple Backup Locations**: Store backups in multiple locations
3. **Documentation**: Keep backup procedures documented
4. **Automation**: Automate backup process as much as possible
5. **Monitoring**: Monitor backup success/failure
6. **Retention Policy**: Follow retention policy strictly
7. **Version Control**: Keep backup scripts in version control

## Quick Reference

### Create Backup
```bash
npm run backup
# or
node scripts/backupDb.mjs
```

### Restore Backup
```bash
npm run backup:restore <backup_file>
# or
pg_restore -d $DB_NAME backup.dump
```

### List Available Backups
```bash
ls -lh backups/
```

## Additional Resources

- [PostgreSQL Backup Documentation](https://www.postgresql.org/docs/current/backup.html)
- [pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)
- [pg_restore Documentation](https://www.postgresql.org/docs/current/app-pgrestore.html)

