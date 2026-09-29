import { listFiles } from './unifiedFileOperations';

const fileListCache = new Map();
const pendingRequests = new Map();
const cacheVersions = new Map();

export const getCachedFileList = (categoryPath) => fileListCache.get(categoryPath) || null;

export const loadCachedFileList = async (categoryPath, { forceRefresh = false, forceNewPermission = false } = {}) => {
  if (!forceRefresh && !forceNewPermission && fileListCache.has(categoryPath)) {
    return fileListCache.get(categoryPath);
  }

  if (!forceRefresh && !forceNewPermission && pendingRequests.has(categoryPath)) {
    return pendingRequests.get(categoryPath);
  }

  const version = cacheVersions.get(categoryPath) || 0;
  const request = listFiles(categoryPath, forceNewPermission).then((result) => {
    if (result.success && (cacheVersions.get(categoryPath) || 0) === version) {
      fileListCache.set(categoryPath, result);
    }
    return result;
  }).finally(() => {
    if (pendingRequests.get(categoryPath) === request) pendingRequests.delete(categoryPath);
  });

  pendingRequests.set(categoryPath, request);
  return request;
};

export const invalidateFileList = (categoryPath) => {
  fileListCache.delete(categoryPath);
  pendingRequests.delete(categoryPath);
  cacheVersions.set(categoryPath, (cacheVersions.get(categoryPath) || 0) + 1);
};
