import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates', 'emails');

/**
 * อ่าน email template จากไฟล์
 * @param {string} templateName - ชื่อไฟล์ template (เช่น 'verification-email')
 * @returns {Promise<string>} HTML content ของ template
 */
export const loadTemplate = async (templateName) => {
  try {
    const templatePath = path.join(TEMPLATES_DIR, `${templateName}.html`);
    const html = await fs.readFile(templatePath, 'utf-8');
    return html;
  } catch (error) {
    throw new Error(`Failed to load email template: ${templateName}. Error: ${error.message}`);
  }
};

/**
 * Render template โดยแทนที่ placeholders
 * @param {string} template - HTML template string
 * @param {Object} variables - ตัวแปรที่จะแทนที่ใน template (เช่น { verifyUrl: '...' })
 * @returns {string} Rendered HTML
 */
export const renderTemplate = (template, variables = {}) => {
  let rendered = template;
  
  // แทนที่ placeholders ด้วย format {{variableName}}
  // ใช้ regex เพื่อหา placeholders ทั้งหมดใน template
  rendered = rendered.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables.hasOwnProperty(key) ? (variables[key] || '') : '';
  });
  
  return rendered;
};

/**
 * โหลดและ render template ในขั้นตอนเดียว
 * @param {string} templateName - ชื่อไฟล์ template
 * @param {Object} variables - ตัวแปรที่จะแทนที่
 * @returns {Promise<string>} Rendered HTML
 */
export const loadAndRenderTemplate = async (templateName, variables = {}) => {
  const template = await loadTemplate(templateName);
  return renderTemplate(template, variables);
};

export default {
  loadTemplate,
  renderTemplate,
  loadAndRenderTemplate
};

