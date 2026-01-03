import { describe, it, expect } from '@jest/globals';
import { loadTemplate, renderTemplate, loadAndRenderTemplate } from '../utils/emailTemplate.mjs';

describe('Email Template Utils', () => {
  describe('renderTemplate', () => {
    it('should replace placeholders correctly', () => {
      const template = 'Hello {{name}}, your link is {{url}}';
      const variables = {
        name: 'John',
        url: 'https://example.com'
      };

      const result = renderTemplate(template, variables);

      expect(result).toBe('Hello John, your link is https://example.com');
      expect(result).not.toContain('{{name}}');
      expect(result).not.toContain('{{url}}');
    });

    it('should handle multiple occurrences of the same placeholder', () => {
      const template = '{{name}} and {{name}} are friends';
      const variables = {
        name: 'Alice'
      };

      const result = renderTemplate(template, variables);

      expect(result).toBe('Alice and Alice are friends');
    });

    it('should handle empty variables object', () => {
      const template = 'Hello {{name}}';
      const result = renderTemplate(template, {});

      expect(result).toBe('Hello ');
    });
  });

  describe('loadAndRenderTemplate', () => {
    it('should load and render verification email template', async () => {
      const variables = {
        verifyUrl: 'https://example.com/verify?token=abc123'
      };

      const html = await loadAndRenderTemplate('verification-email', variables);

      expect(html).toContain('Verify Your Email');
      expect(html).toContain(variables.verifyUrl);
      expect(html).not.toContain('{{verifyUrl}}');
      expect(html).toContain('<!DOCTYPE html>');
    });

    it('should load and render reset password email template', async () => {
      const variables = {
        resetUrl: 'https://example.com/reset?token=xyz789'
      };

      const html = await loadAndRenderTemplate('reset-password-email', variables);

      expect(html).toContain('Reset Password');
      expect(html).toContain(variables.resetUrl);
      expect(html).not.toContain('{{resetUrl}}');
      expect(html).toContain('<!DOCTYPE html>');
    });

    it('should throw error for non-existent template', async () => {
      await expect(
        loadAndRenderTemplate('non-existent-template', {})
      ).rejects.toThrow();
    });
  });
});

