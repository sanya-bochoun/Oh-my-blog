# Email Templates Documentation

## Overview

Email templates ถูกแยกออกมาเป็นไฟล์ HTML แยกต่างหาก เพื่อให้ง่ายต่อการแก้ไขและดูแลรักษา

## Structure

```
backend/
  templates/
    emails/
      verification-email.html    # Template สำหรับ email verification
      reset-password-email.html  # Template สำหรับ password reset
  utils/
    emailTemplate.mjs            # Utility functions สำหรับโหลดและ render templates
  config/
    email.mjs                    # Email configuration และ functions
```

## Template Files

### verification-email.html

Template สำหรับส่ง email ยืนยันการลงทะเบียน

**Variables:**
- `{{verifyUrl}}` - URL สำหรับ verify email (จะถูกแทนที่ด้วยค่าจริง)

**Usage:**
```javascript
import { sendVerificationEmail } from '../config/email.mjs';

await sendVerificationEmail('user@example.com', verificationToken);
```

### reset-password-email.html

Template สำหรับส่ง email รีเซ็ตรหัสผ่าน

**Variables:**
- `{{resetUrl}}` - URL สำหรับรีเซ็ตรหัสผ่าน (จะถูกแทนที่ด้วยค่าจริง)

**Usage:**
```javascript
import { sendResetPasswordEmail } from '../config/email.mjs';

await sendResetPasswordEmail('user@example.com', resetToken);
```

## Utility Functions

### loadTemplate(templateName)

โหลด template จากไฟล์

```javascript
import { loadTemplate } from '../utils/emailTemplate.mjs';

const html = await loadTemplate('verification-email');
```

### renderTemplate(template, variables)

Render template โดยแทนที่ placeholders

```javascript
import { renderTemplate } from '../utils/emailTemplate.mjs';

const html = renderTemplate(template, { verifyUrl: 'https://...' });
```

### loadAndRenderTemplate(templateName, variables)

โหลดและ render template ในขั้นตอนเดียว (แนะนำ)

```javascript
import { loadAndRenderTemplate } from '../utils/emailTemplate.mjs';

const html = await loadAndRenderTemplate('verification-email', {
  verifyUrl: 'https://example.com/verify?token=...'
});
```

## Template Syntax

Templates ใช้รูปแบบ `{{variableName}}` สำหรับ placeholders

**Example:**
```html
<a href="{{verifyUrl}}">Verify Email</a>
<p>Welcome {{userName}}!</p>
```

## Adding New Templates

1. สร้างไฟล์ HTML ใหม่ใน `backend/templates/emails/`
2. ใช้ `{{variableName}}` สำหรับ placeholders
3. เพิ่ม function ใน `backend/config/email.mjs` เพื่อใช้ template ใหม่

**Example:**
```javascript
// backend/config/email.mjs
export const sendWelcomeEmail = async (to, userName) => {
  const html = await loadAndRenderTemplate('welcome-email', {
    userName,
    loginUrl: `${process.env.FRONTEND_URL}/login`
  });
  
  return sendEmail(to, 'Welcome!', html);
};
```

## Benefits

1. **Separation of Concerns**: HTML templates แยกออกจาก JavaScript code
2. **Easy Maintenance**: แก้ไข template ได้โดยไม่ต้องแก้ JavaScript
3. **Reusability**: Template สามารถใช้ซ้ำได้หลายที่
4. **Better Collaboration**: Designer สามารถแก้ไข HTML template ได้โดยไม่ต้องแก้ code
5. **Version Control**: ง่ายต่อการ track changes ของ templates

## Testing

เมื่อแก้ไข templates สามารถทดสอบได้โดย:

1. ส่ง test email ผ่าน API
2. ตรวจสอบ email ใน inbox หรือ email testing service
3. ตรวจสอบว่า placeholders ถูกแทนที่ด้วยค่าที่ถูกต้อง

## Notes

- Templates ใช้ UTF-8 encoding
- สนับสนุน HTML และ inline CSS
- ควรทดสอบ template กับ email clients ต่างๆ (Gmail, Outlook, etc.)
- ใช้ inline styles เพื่อความเข้ากันได้กับ email clients

