import { loadAndRenderTemplate } from './utils/emailTemplate.mjs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Improvements (ข้อ 11-13)\n');

let allTestsPassed = true;

// Test 1: Email Templates (ข้อ 11)
console.log('1️⃣  Testing Email Templates (ข้อ 11)...');
try {
  // Test verification email
  const verificationHtml = await loadAndRenderTemplate('verification-email', {
    verifyUrl: 'https://test.com/verify?token=test123'
  });
  
  if (verificationHtml.includes('test.com') && !verificationHtml.includes('{{verifyUrl}}')) {
    console.log('   ✅ Verification email template works');
  } else {
    console.log('   ❌ Verification email template failed');
    allTestsPassed = false;
  }

  // Test reset password email
  const resetHtml = await loadAndRenderTemplate('reset-password-email', {
    resetUrl: 'https://test.com/reset?token=test456'
  });
  
  if (resetHtml.includes('test.com') && !resetHtml.includes('{{resetUrl}}')) {
    console.log('   ✅ Reset password email template works');
  } else {
    console.log('   ❌ Reset password email template failed');
    allTestsPassed = false;
  }
} catch (error) {
  console.log('   ❌ Email templates error:', error.message);
  allTestsPassed = false;
}

// Test 2: Test Suite Files (ข้อ 12)
console.log('\n2️⃣  Testing Test Suite Files (ข้อ 12)...');
try {
  const jestConfigPath = path.join(__dirname, 'jest.config.mjs');
  await fs.access(jestConfigPath);
  console.log('   ✅ jest.config.mjs exists');

  const testFiles = [
    '__tests__/setup.mjs',
    '__tests__/auth.test.mjs',
    '__tests__/utils.test.mjs',
    '__tests__/userManagement.test.mjs'
  ];

  for (const testFile of testFiles) {
    const testPath = path.join(__dirname, testFile);
    try {
      await fs.access(testPath);
      console.log(`   ✅ ${testFile} exists`);
    } catch {
      console.log(`   ⚠️  ${testFile} not found`);
    }
  }
} catch (error) {
  console.log('   ❌ Test suite files error:', error.message);
  allTestsPassed = false;
}

// Test 3: Cleanup Script (ข้อ 13)
console.log('\n3️⃣  Testing Cleanup Script (ข้อ 13)...');
try {
  const cleanupScriptPath = path.join(__dirname, 'scripts', 'cleanupUploads.mjs');
  await fs.access(cleanupScriptPath);
  console.log('   ✅ cleanupUploads.mjs exists');

  // Check if uploads directory exists
  const uploadsPath = path.join(__dirname, 'uploads');
  try {
    const stats = await fs.stat(uploadsPath);
    if (stats.isDirectory()) {
      const files = await fs.readdir(uploadsPath, { recursive: true });
      console.log(`   ✅ uploads/ directory exists (${files.length} items)`);
    }
  } catch {
    console.log('   ⚠️  uploads/ directory not found (this is OK if no files uploaded yet)');
  }
} catch (error) {
  console.log('   ❌ Cleanup script error:', error.message);
  allTestsPassed = false;
}

// Test 4: Package.json Scripts
console.log('\n4️⃣  Checking package.json scripts...');
try {
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
  
  const requiredScripts = ['test', 'cleanup:uploads'];
  const scripts = packageJson.scripts || {};
  
  for (const scriptName of requiredScripts) {
    if (scripts[scriptName]) {
      console.log(`   ✅ npm run ${scriptName} exists`);
    } else {
      console.log(`   ⚠️  npm run ${scriptName} not found`);
    }
  }
} catch (error) {
  console.log('   ❌ Package.json check error:', error.message);
}

// Summary
console.log('\n' + '='.repeat(50));
if (allTestsPassed) {
  console.log('✅ All critical tests passed!');
  console.log('\nNext steps:');
  console.log('1. Install test dependencies: npm install --save-dev jest @jest/globals supertest');
  console.log('2. Update package.json test scripts (see TESTING_GUIDE_IMPROVEMENTS.md)');
  console.log('3. Run: npm test');
} else {
  console.log('❌ Some tests failed. Please check the errors above.');
}
console.log('='.repeat(50));

