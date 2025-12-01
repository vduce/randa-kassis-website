/**
 * Upload Service Tests
 * Tests for file upload processing functionality
 */

import {
  extractMetadata,
  validateFile,
  readFileContent,
  validateBatchUpload
} from '../uploadService';

describe('uploadService', () => {
  describe('extractMetadata', () => {
    it('should extract title from h4 tag', () => {
      const content = '<h4>Test Article Title</h4>\n\nContent here...';
      const metadata = extractMetadata(content, 'test.md');
      
      expect(metadata.title).toBe('Test Article Title');
    });

    it('should extract publication info', () => {
      const content = '<h4>Title</h4>\n\nPublished in Al-Ahram Newspaper\n<br>\n10 June 2008';
      const metadata = extractMetadata(content, 'test.md');
      
      expect(metadata.publishedIn).toBe('Al-Ahram Newspaper');
    });

    it('should extract date from content', () => {
      const content = '<h4>Title</h4>\n\nPublished in Test\n<br>\n10 June 2008\n\nContent...';
      const metadata = extractMetadata(content, 'test.md');
      
      expect(metadata.date).toBe('10 June 2008');
      expect(metadata.publishedAt).toBe('10 June 2008');
    });

    it('should use filename as fallback title', () => {
      const content = 'Content without title';
      const metadata = extractMetadata(content, 'my-article.md');
      
      expect(metadata.title).toBe('my article');
    });

    it('should extract location if present', () => {
      const content = '<h4>Title</h4>\n\nLocation: Paris, France\n\nContent...';
      const metadata = extractMetadata(content, 'test.md');
      
      expect(metadata.location).toBe('Paris, France');
    });

    it('should extract year for paintings', () => {
      const content = '<h4>Painting Title</h4>\n\nYear: 2020\n\nDescription...';
      const metadata = extractMetadata(content, 'test.md');
      
      expect(metadata.year).toBe('2020');
    });
  });

  describe('validateFile', () => {
    it('should validate correct markdown file', () => {
      const file = {
        name: 'test.md',
        size: 1024
      };
      
      const result = validateFile(file);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-markdown files', () => {
      const file = {
        name: 'test.txt',
        size: 1024
      };
      
      const result = validateFile(file);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Only .md (markdown) files are allowed');
    });

    it('should reject files larger than 5MB', () => {
      const file = {
        name: 'test.md',
        size: 6 * 1024 * 1024 // 6MB
      };
      
      const result = validateFile(file);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('exceeds maximum limit');
    });

    it('should reject empty files', () => {
      const file = {
        name: 'test.md',
        size: 0
      };
      
      const result = validateFile(file);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('File is empty');
    });
  });

  describe('validateBatchUpload', () => {
    it('should separate valid and invalid files', () => {
      const files = [
        { name: 'valid1.md', size: 1024 },
        { name: 'invalid.txt', size: 1024 },
        { name: 'valid2.md', size: 2048 },
        { name: 'toolarge.md', size: 6 * 1024 * 1024 }
      ];
      
      const result = validateBatchUpload(files);
      
      expect(result.validFiles).toHaveLength(2);
      expect(result.invalidFiles).toHaveLength(2);
      expect(result.summary.total).toBe(4);
      expect(result.summary.valid).toBe(2);
      expect(result.summary.invalid).toBe(2);
    });

    it('should return valid=true when all files are valid', () => {
      const files = [
        { name: 'file1.md', size: 1024 },
        { name: 'file2.md', size: 2048 }
      ];
      
      const result = validateBatchUpload(files);
      
      expect(result.valid).toBe(true);
      expect(result.validFiles).toHaveLength(2);
      expect(result.invalidFiles).toHaveLength(0);
    });

    it('should return valid=false when any file is invalid', () => {
      const files = [
        { name: 'valid.md', size: 1024 },
        { name: 'invalid.txt', size: 1024 }
      ];
      
      const result = validateBatchUpload(files);
      
      expect(result.valid).toBe(false);
    });
  });

  describe('readFileContent', () => {
    it('should read file content as text', async () => {
      const content = 'Test file content';
      const blob = new Blob([content], { type: 'text/plain' });
      const file = new File([blob], 'test.md', { type: 'text/plain' });
      
      const result = await readFileContent(file);
      
      expect(result).toBe(content);
    });

    it('should handle UTF-8 content', async () => {
      const content = 'Test with émojis 🎉 and spëcial çharacters';
      const blob = new Blob([content], { type: 'text/plain' });
      const file = new File([blob], 'test.md', { type: 'text/plain' });
      
      const result = await readFileContent(file);
      
      expect(result).toBe(content);
    });
  });
});
