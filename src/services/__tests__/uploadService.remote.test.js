import { processFileUpload } from '../uploadService';
import { createFile, fileExists } from '../unifiedFileOperations';
import { updateJSONIndexEntry } from '../serverJsonService';

jest.mock('../unifiedFileOperations', () => ({
  createFile: jest.fn(), fileExists: jest.fn(), generateNextFilename: jest.fn(), getStorageMode: () => 'bunny',
}));
jest.mock('../serverJsonService', () => ({
  updateJSONIndexEntry: jest.fn(), supportsJSONIndex: key => key === 'articles',
}));

const document = '<h4>Uploaded production-style article</h4>\n\nThis is a disposable test paragraph long enough to become the article description on the public website.';
const makeFile = () => new File([document], 'article99.md', { type: 'text/markdown' });
beforeEach(() => {
  jest.clearAllMocks();
  fileExists.mockResolvedValue({ success: true, data: { exists: false } });
  createFile.mockResolvedValue({ success: true, data: { size: document.length } });
  updateJSONIndexEntry.mockResolvedValue({ success: true });
});

test('a Bunny upload creates Markdown through unified storage and publishes its metadata', async () => {
  const result = await processFileUpload(makeFile(), 'public/articles', 'articles');
  expect(result.success).toBe(true);
  expect(createFile).toHaveBeenCalledWith('public/articles', 'article99.md', document);
  expect(updateJSONIndexEntry).toHaveBeenCalledWith('articles', 'article99.md', expect.objectContaining({
    title: 'Uploaded production-style article', description: expect.stringContaining('disposable test paragraph'),
  }));
});

test('a metadata failure reports partial upload instead of false success', async () => {
  updateJSONIndexEntry.mockResolvedValue({ success: false, error: { message: 'Unavailable' } });
  const result = await processFileUpload(makeFile(), 'public/articles', 'articles');
  expect(result.success).toBe(false);
  expect(result.created).toBe(true);
  expect(result.error.code).toBe('METADATA_UPDATE_FAILED');
});

test('a storage authentication failure stops the upload before creating a file', async () => {
  fileExists.mockResolvedValue({ success: false, error: { code: 'AUTH_ERROR', message: 'Please log in' } });
  const result = await processFileUpload(makeFile(), 'public/articles', 'articles');
  expect(result.success).toBe(false);
  expect(createFile).not.toHaveBeenCalled();
  expect(updateJSONIndexEntry).not.toHaveBeenCalled();
});
