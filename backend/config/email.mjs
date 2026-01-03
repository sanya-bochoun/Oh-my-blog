import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { loadAndRenderTemplate } from '../utils/emailTemplate.mjs';

dotenv.config();

// สร้าง transporter สำหรับส่งอีเมล
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ฟังก์ชันสำหรับส่งอีเมล
export const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// ฟังก์ชันสำหรับส่งอีเมลรีเซ็ตรหัสผ่าน
export const sendResetPasswordEmail = async (to, resetToken) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
  console.log('Generated reset URL:', resetUrl);
  
  // โหลดและ render template
  const html = await loadAndRenderTemplate('reset-password-email', {
    resetUrl
  });

  return sendEmail(to, 'Reset Password', html);
};

// ฟังก์ชันสำหรับส่งอีเมลยืนยันอีเมล
export const sendVerificationEmail = async (to, verificationToken) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verifyUrl = `${frontendUrl}/verify-email/${verificationToken}`;
  console.log('Generated verification URL:', verifyUrl);
  
  // โหลดและ render template
  const html = await loadAndRenderTemplate('verification-email', {
    verifyUrl
  });

  return sendEmail(to, 'Verify Your Email', html);
};

export default {
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail
}; 