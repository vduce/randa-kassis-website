/**
 * FileUpload Component
 * Handles file upload with drag-and-drop and file browser
 */

import React, { useState, useRef, useCallback } from 'react';
import useFileUpload from '../../hooks/useFileUpload';
import './FileUpload.css';

const FileUpload = ({ category, onUploadComplete, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const {
    uploading,
    uploadProgress,
    uploadResults,
    validationErrors,
    uploadFiles,
    resetUpload
  } = useFileUpload(
    category.path,
    category.key,
    (result) => {
      // Call parent callback after upload completes
      if (onUploadComplete) {
        onUploadComplete(result);
      }
    }
  );

  /**
   * Handle drag events
   */
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  /**
   * Handle drop event
   */
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles(files);
    }
  }, []);

  /**
   * Handle file input change
   */
  const handleFileInputChange = useCallback((e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    }
  }, []);

  /**
   * Open file browser
   */
  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Remove selected file
   */
  const handleRemoveFile = useCallback((index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Start upload
   */
  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    await uploadFiles(selectedFiles);
  }, [selectedFiles, uploadFiles]);

  /**
   * Close and reset
   */
  const handleClose = useCallback(() => {
    resetUpload();
    setSelectedFiles([]);
    if (onClose) {
      onClose();
    }
  }, [resetUpload, onClose]);

  /**
   * Format file size
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const hasResults = uploadResults.length > 0;
  const allSuccessful = uploadResults.length > 0 && uploadResults.every(r => r.success);
  const hasErrors = uploadResults.some(r => !r.success) || validationErrors.length > 0;

  return (
    <div className="file-upload-modal">
      <div className="file-upload-container">
        <div className="file-upload-header">
          <h2>Upload Files to {category.label}</h2>
          <button 
            className="close-button" 
            onClick={handleClose}
            disabled={uploading}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="file-upload-body">
          {!hasResults ? (
            <>
              {/* Drop Zone */}
              <div
                className={`drop-zone ${dragActive ? 'active' : ''} ${uploading ? 'disabled' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="drop-zone-content">
                  <span className="drop-zone-icon">📁</span>
                  <p className="drop-zone-text">
                    {dragActive ? 'Drop files here' : 'Drag and drop .md files here'}
                  </p>
                  <p className="drop-zone-subtext">or</p>
                  <button
                    className="browse-button"
                    onClick={handleBrowseClick}
                    disabled={uploading}
                  >
                    Browse Files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".md"
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                  />
                  <p className="drop-zone-hint">
                    Only .md files, max 5MB each
                  </p>
                </div>
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="selected-files">
                  <h3>Selected Files ({selectedFiles.length})</h3>
                  <div className="file-list">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="file-item">
                        <div className="file-info">
                          <span className="file-icon">📄</span>
                          <div className="file-details">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">{formatFileSize(file.size)}</span>
                          </div>
                        </div>
                        {!uploading && (
                          <button
                            className="remove-button"
                            onClick={() => handleRemoveFile(index)}
                            aria-label="Remove file"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="validation-errors">
                  <h3>Validation Errors</h3>
                  {validationErrors.map((error, index) => (
                    <div key={index} className="error-item">
                      <span className="error-icon">⚠️</span>
                      <div className="error-details">
                        <span className="error-file">{error.file.name}</span>
                        <span className="error-message">{error.errors.join(', ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div className="upload-progress">
                  <div className="progress-header">
                    <span>Uploading files...</span>
                    <span>{uploadProgress.percentage}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${uploadProgress.percentage}%` }}
                    />
                  </div>
                  <div className="progress-details">
                    <span>{uploadProgress.current} of {uploadProgress.total} files</span>
                    <span className="current-file">{uploadProgress.currentFile}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Upload Results */
            <div className="upload-results">
              <div className={`results-summary ${allSuccessful ? 'success' : 'partial'}`}>
                <span className="summary-icon">{allSuccessful ? '✓' : '⚠️'}</span>
                <div className="summary-text">
                  <h3>
                    {allSuccessful 
                      ? 'All files uploaded successfully!' 
                      : 'Upload completed with some errors'}
                  </h3>
                  <p>
                    {uploadResults.filter(r => r.success).length} successful, {' '}
                    {uploadResults.filter(r => !r.success).length} failed
                  </p>
                </div>
              </div>

              <div className="results-list">
                {uploadResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`result-item ${result.success ? 'success' : 'error'}`}
                  >
                    <span className="result-icon">
                      {result.success ? '✓' : '✗'}
                    </span>
                    <div className="result-details">
                      <span className="result-filename">
                        {result.filename}
                        {result.targetFilename && result.targetFilename !== result.filename && (
                          <span className="renamed"> → {result.targetFilename}</span>
                        )}
                      </span>
                      {result.success ? (
                        <span className="result-message">
                          Uploaded successfully
                          {result.metadata?.title && ` - ${result.metadata.title}`}
                        </span>
                      ) : (
                        <span className="result-error">
                          {result.error?.message || 'Upload failed'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="file-upload-footer">
          {!hasResults ? (
            <>
              <button
                className="cancel-button"
                onClick={handleClose}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                className="upload-button"
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploading}
              >
                {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}`}
              </button>
            </>
          ) : (
            <button
              className="done-button"
              onClick={handleClose}
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
