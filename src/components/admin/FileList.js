import React, { useState, useEffect } from 'react';
import { listFiles, sortFiles, filterFiles, paginateFiles } from '../../services/unifiedFileOperations';
import './FileList.css';

const FileList = ({ category, onSelectFile, onDeleteFile, onAddNew, refreshTrigger }) => {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [paginatedData, setPaginatedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [hasPermission, setHasPermission] = useState(false);

  // Load files when category changes or refresh is triggered
  useEffect(() => {
    if (category) {
      loadFiles();
    }
  }, [category, refreshTrigger]);

  // Apply filters and sorting when files or filters change
  useEffect(() => {
    if (files.length > 0) {
      let result = [...files];
      
      // Apply search filter
      if (searchTerm) {
        result = filterFiles(result, searchTerm);
      }
      
      // Apply sorting
      result = sortFiles(result, sortBy, sortOrder);
      
      setFilteredFiles(result);
      
      // Reset to page 1 when filters change
      setCurrentPage(1);
    } else {
      setFilteredFiles([]);
    }
  }, [files, searchTerm, sortBy, sortOrder]);

  // Apply pagination when filtered files or page changes
  useEffect(() => {
    if (filteredFiles.length > 0) {
      const paginated = paginateFiles(filteredFiles, currentPage, pageSize);
      setPaginatedData(paginated);
    } else {
      setPaginatedData(null);
    }
  }, [filteredFiles, currentPage, pageSize]);

  const loadFiles = async (forceNewPermission = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await listFiles(category.path, forceNewPermission);
      
      if (result.success) {
        setFiles(result.data.files);
        setHasPermission(true);
      } else {
        if (result.error.code === 'NOT_SUPPORTED') {
          setError('Your browser does not support the File System Access API. Please use Chrome or Edge.');
        } else if (result.error.code === 'PERMISSION_DENIED' || result.error.code === 'USER_CANCELLED') {
          setError('Please grant permission to access the directory.');
          setHasPermission(false);
        } else if (result.error.code === 'NotFoundError') {
          setError(`Directory "${category.path}" not found. Make sure you selected the correct project root folder.`);
          setHasPermission(false);
        } else {
          setError(result.error.message);
        }
        setFiles([]);
      }
    } catch (err) {
      setError('An unexpected error occurred while loading files.');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantPermission = () => {
    loadFiles(true);
  };

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!category) {
    return (
      <div className="file-list-empty">
        <p>Select a category to view files</p>
      </div>
    );
  }

  return (
    <div className="file-list">
      {/* Header with search and add button */}
      <div className="file-list-header">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        <div className="header-actions">
          <button className="upload-button" onClick={() => window.dispatchEvent(new CustomEvent('openFileUpload'))}>
            <span className="button-icon">📤</span>
            Upload
          </button>
          <button className="add-new-button" onClick={onAddNew}>
            <span className="button-icon">+</span>
            Add New
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="file-list-loading">
          <div className="spinner"></div>
          <p>Loading files...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="file-list-error">
          <p className="error-message">{error}</p>
          {!hasPermission && (
            <>
              <div className="error-help">
                <p><strong>Instructions:</strong></p>
                <ol>
                  <li>Click "Grant Permission" below</li>
                  <li>Select your <strong>project root folder</strong> (the folder containing the "public" directory)</li>
                  <li>Click "Select Folder" or "Open"</li>
                </ol>
              </div>
              <button className="retry-button" onClick={handleGrantPermission}>
                Grant Permission
              </button>
            </>
          )}
          {hasPermission && (
            <button className="retry-button" onClick={() => loadFiles(false)}>
              Retry
            </button>
          )}
        </div>
      )}

      {/* File list */}
      {!loading && !error && files.length === 0 && (
        <div className="file-list-empty">
          <p>No files found in this category</p>
          <button className="add-first-button" onClick={onAddNew}>
            Create your first file
          </button>
        </div>
      )}

      {!loading && !error && files.length > 0 && (
        <>
          {/* Results info */}
          <div className="file-list-info">
            <span>
              {filteredFiles.length === files.length
                ? `${files.length} file${files.length !== 1 ? 's' : ''}`
                : `${filteredFiles.length} of ${files.length} file${files.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          {/* Table */}
          <div className="file-table-container">
            <table className="file-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')} className="sortable">
                    Filename
                    {sortBy === 'name' && (
                      <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th onClick={() => handleSort('size')} className="sortable">
                    Size
                    {sortBy === 'size' && (
                      <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th onClick={() => handleSort('date')} className="sortable">
                    Modified
                    {sortBy === 'date' && (
                      <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="actions-column">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData && paginatedData.files.map((file) => (
                  <tr key={file.name} className="file-row">
                    <td className="file-name">{file.name}</td>
                    <td className="file-size">{formatFileSize(file.size)}</td>
                    <td className="file-date">{formatDate(file.modified)}</td>
                    <td className="file-actions">
                      <button
                        className="action-button edit-button"
                        onClick={() => onSelectFile(file)}
                        title="Edit file"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="action-button delete-button"
                        onClick={() => onDeleteFile(file)}
                        title="Delete file"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {paginatedData && paginatedData.totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!paginatedData.hasPreviousPage}
              >
                ← Previous
              </button>
              <span className="pagination-info">
                Page {paginatedData.currentPage} of {paginatedData.totalPages}
              </span>
              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!paginatedData.hasNextPage}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FileList;
