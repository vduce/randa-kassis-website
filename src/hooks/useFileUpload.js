/**
 * useFileUpload Hook
 * Custom React hook for managing file upload state and operations
 */

import { useState, useCallback } from 'react';
import { processBatchUpload, validateBatchUpload } from '../services/uploadService';

const useFileUpload = (categoryPath, categoryKey, onUploadComplete = null) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
    percentage: 0,
    currentFile: ''
  });
  const [uploadResults, setUploadResults] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);

  /**
   * Reset upload state
   */
  const resetUpload = useCallback(() => {
    setUploading(false);
    setUploadProgress({
      current: 0,
      total: 0,
      percentage: 0,
      currentFile: ''
    });
    setUploadResults([]);
    setValidationErrors([]);
  }, []);

  /**
   * Validate files before upload
   */
  const validateFiles = useCallback((files) => {
    const validation = validateBatchUpload(files);
    
    if (!validation.valid) {
      setValidationErrors(validation.invalidFiles);
      return {
        valid: false,
        validFiles: validation.validFiles,
        invalidFiles: validation.invalidFiles,
        summary: validation.summary
      };
    }

    setValidationErrors([]);
    return {
      valid: true,
      validFiles: validation.validFiles,
      invalidFiles: [],
      summary: validation.summary
    };
  }, []);

  /**
   * Upload files
   */
  const uploadFiles = useCallback(async (files) => {
    if (!files || files.length === 0) {
      return {
        success: false,
        error: 'No files provided'
      };
    }

    // Validate files first
    const validation = validateFiles(files);
    if (!validation.valid) {
      return {
        success: false,
        error: 'Some files failed validation',
        invalidFiles: validation.invalidFiles
      };
    }

    setUploading(true);
    setUploadResults([]);

    try {
      // Process batch upload with progress callback
      const result = await processBatchUpload(
        validation.validFiles,
        categoryPath,
        categoryKey,
        (progress) => {
          setUploadProgress(progress);
          
          // Update results incrementally
          setUploadResults(prev => {
            const newResults = [...prev];
            const existingIndex = newResults.findIndex(
              r => r.filename === progress.result.filename
            );
            
            if (existingIndex >= 0) {
              newResults[existingIndex] = progress.result;
            } else {
              newResults.push(progress.result);
            }
            
            return newResults;
          });
        }
      );

      setUploadResults(result.results);

      // Call completion callback if provided
      if (onUploadComplete) {
        onUploadComplete(result);
      }

      return result;
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred during upload'
      };
    } finally {
      setUploading(false);
    }
  }, [categoryPath, categoryKey, validateFiles, onUploadComplete]);

  /**
   * Upload single file
   */
  const uploadFile = useCallback(async (file) => {
    return await uploadFiles([file]);
  }, [uploadFiles]);

  return {
    uploading,
    uploadProgress,
    uploadResults,
    validationErrors,
    uploadFile,
    uploadFiles,
    validateFiles,
    resetUpload
  };
};

export default useFileUpload;
