import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { readFile, createFile, updateFile, generateNextFilename } from '../../services/unifiedFileOperations';
import { getJSONIndexEntry, updateJSONIndexEntry } from '../../services/jsonIndexService';
import MarkdownPreview from './MarkdownPreview';
import './MarkdownEditor.css';

const MarkdownEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { category, file, mode } = location.state || {};

  const [content, setContent] = useState('');
  const [filename, setFilename] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [originalModified, setOriginalModified] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'split', 'editor', 'preview'
  const [paneSize, setPaneSize] = useState(50); // Percentage for left pane
  const [showMetadata, setShowMetadata] = useState(false);
  
  // Metadata fields
  const [metadata, setMetadata] = useState({
    title: '',
    publishedIn: '',
    publishedAt: '',
    description: ''
  });

  // Load file content if editing
  useEffect(() => {
    if (mode === 'edit' && file && category) {
      loadFileContent();
    } else if (mode === 'create' && category) {
      initializeNewFile();
    } else {
      // No valid state, redirect back
      navigate('/admin/dashboard');
    }
  }, []);

  // Track dirty state
  useEffect(() => {
    setIsDirty(content !== originalContent);
  }, [content, originalContent]);

  // Auto-save to localStorage
  useEffect(() => {
    if (isDirty && content) {
      const timer = setTimeout(() => {
        saveDraft();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(timer);
    }
  }, [content, isDirty]);

  const loadFileContent = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await readFile(category.path, file.name);

      if (result.success) {
        setContent(result.data.content);
        setOriginalContent(result.data.content);
        setOriginalModified(result.data.modified);
        setFilename(file.name);
        
        // Load metadata from JSON index
        const metadataResult = await getJSONIndexEntry(category.key, file.name);
        if (metadataResult.success) {
          setMetadata({
            title: metadataResult.data.title || '',
            publishedIn: metadataResult.data.publishedIn || '',
            publishedAt: metadataResult.data.publishedAt || '',
            description: metadataResult.data.description || ''
          });
        }
        
        // Check for draft
        checkForDraft(file.name);
      } else {
        setError(`Failed to load file: ${result.error.message}`);
      }
    } catch (err) {
      setError('An unexpected error occurred while loading the file.');
    } finally {
      setLoading(false);
    }
  };

  const initializeNewFile = async () => {
    setLoading(true);

    try {
      // Generate next filename based on category pattern
      const patterns = {
        articles: { pattern: /article(\d+)\.md/, prefix: 'article' },
        encounters: { pattern: /ed(\d+)\.md/, prefix: 'ed' },
        interviews_politicians: { pattern: /po(\d+)\.md/, prefix: 'po' },
        interviews_painters: { pattern: /painters(\d+)\.md/, prefix: 'painters' },
        interviews_critics: { pattern: /ec(\d+)\.md/, prefix: 'ec' },
        story: { pattern: /story(\d+)\.md/, prefix: 'story' },
        paintings: { pattern: /painting(\d+)\.md/, prefix: 'painting' },
        exhibitions: { pattern: /em(\d+)\.md/, prefix: 'em' },
        throughMyEyes: { pattern: /myeyes(\d+)\.md/, prefix: 'myeyes' }
      };

      const categoryPattern = patterns[category.key];
      if (categoryPattern) {
        const nextFilename = await generateNextFilename(
          category.path,
          categoryPattern.pattern,
          categoryPattern.prefix
        );
        setFilename(nextFilename);
      } else {
        setFilename('new-file.md');
      }

      setContent('# New Document\n\nStart writing your content here...');
      setOriginalContent('');
    } catch (err) {
      setError('Failed to initialize new file.');
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = () => {
    const draftKey = `draft_${category.key}_${filename}`;
    localStorage.setItem(draftKey, JSON.stringify({
      content,
      timestamp: Date.now()
    }));
  };

  const checkForDraft = (fname) => {
    const draftKey = `draft_${category.key}_${fname}`;
    const draft = localStorage.getItem(draftKey);
    
    if (draft) {
      const { content: draftContent, timestamp } = JSON.parse(draft);
      const age = Date.now() - timestamp;
      
      // If draft is less than 24 hours old
      if (age < 24 * 60 * 60 * 1000) {
        if (window.confirm('A draft was found. Would you like to restore it?')) {
          setContent(draftContent);
        } else {
          clearDraft(fname);
        }
      } else {
        clearDraft(fname);
      }
    }
  };

  const clearDraft = (fname) => {
    const draftKey = `draft_${category.key}_${fname || filename}`;
    localStorage.removeItem(draftKey);
  };

  const handleSave = async () => {
    if (!filename.trim()) {
      alert('Please enter a filename');
      return;
    }

    if (!filename.endsWith('.md')) {
      alert('Filename must end with .md');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let result;

      if (mode === 'create') {
        result = await createFile(category.path, filename, content);
      } else {
        result = await updateFile(category.path, filename, content, originalModified);
      }

      if (result.success) {
        // Update JSON index with metadata
        const jsonResult = await updateJSONIndexEntry(category.key, filename, metadata);
        
        if (!jsonResult.success) {
          console.warn('Failed to update JSON index:', jsonResult.error);
          // Continue anyway - file was saved successfully
        }
        
        setOriginalContent(content);
        setOriginalModified(result.data.modified);
        clearDraft(filename);
        
        // Show success message
        alert('File saved successfully!');
        
        // Navigate back to dashboard
        navigate('/admin/dashboard');
      } else {
        if (result.error.code === 'CONCURRENT_MODIFICATION') {
          if (window.confirm('The file has been modified by another process. Do you want to overwrite it?')) {
            // Retry without modification check
            const retryResult = await updateFile(category.path, filename, content, null);
            if (retryResult.success) {
              setOriginalContent(content);
              clearDraft(filename);
              alert('File saved successfully!');
              navigate('/admin/dashboard');
            } else {
              setError(`Failed to save: ${retryResult.error.message}`);
            }
          }
        } else {
          setError(`Failed to save: ${result.error.message}`);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred while saving the file.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/admin/dashboard');
      }
    } else {
      navigate('/admin/dashboard');
    }
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleFilenameChange = (e) => {
    setFilename(e.target.value);
  };

  if (loading) {
    return (
      <div className="editor-loading">
        <div className="spinner"></div>
        <p>Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="markdown-editor">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <button className="toolbar-button back-button" onClick={handleCancel}>
            ← Back
          </button>
          <div className="filename-input-wrapper">
            <input
              type="text"
              value={filename}
              onChange={handleFilenameChange}
              className="filename-input"
              placeholder="filename.md"
              disabled={mode === 'edit'}
            />
          </div>
          {isDirty && <span className="dirty-indicator">● Unsaved changes</span>}
        </div>

        <div className="toolbar-center">
          <div className="view-mode-toggle">
            <button
              className={`toggle-button ${viewMode === 'editor' ? 'active' : ''}`}
              onClick={() => setViewMode('editor')}
              title="Editor only"
            >
              📝
            </button>
            <button
              className={`toggle-button ${viewMode === 'split' ? 'active' : ''}`}
              onClick={() => setViewMode('split')}
              title="Split view"
            >
              ⚌
            </button>
            <button
              className={`toggle-button ${viewMode === 'preview' ? 'active' : ''}`}
              onClick={() => setViewMode('preview')}
              title="Preview only"
            >
              👁️
            </button>
          </div>
        </div>

        <div className="toolbar-right">
          <button 
            className="toolbar-button metadata-button" 
            onClick={() => setShowMetadata(!showMetadata)}
            title="Toggle metadata editor"
          >
            {showMetadata ? '📝 Hide Metadata' : '📋 Edit Metadata'}
          </button>
          <button className="toolbar-button cancel-button" onClick={handleCancel}>
            Cancel
          </button>
          <button
            className="toolbar-button save-button"
            onClick={handleSave}
            disabled={saving || !isDirty}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Metadata Editor Panel */}
      {showMetadata && (
        <div className="metadata-panel">
          <div className="metadata-content">
            <h3>Content Metadata</h3>
            <p className="metadata-help">This information will be saved to the JSON index file</p>
            
            <div className="metadata-form">
              <div className="form-group">
                <label htmlFor="meta-title">Title *</label>
                <input
                  id="meta-title"
                  type="text"
                  value={metadata.title}
                  onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                  placeholder="Enter article title"
                  className="metadata-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="meta-published-in">Published In</label>
                <input
                  id="meta-published-in"
                  type="text"
                  value={metadata.publishedIn}
                  onChange={(e) => setMetadata({ ...metadata, publishedIn: e.target.value })}
                  placeholder="e.g., Published in Al-Ahram Newspaper"
                  className="metadata-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="meta-published-at">Published Date</label>
                <input
                  id="meta-published-at"
                  type="text"
                  value={metadata.publishedAt}
                  onChange={(e) => setMetadata({ ...metadata, publishedAt: e.target.value })}
                  placeholder="e.g., 28 February 2022"
                  className="metadata-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="meta-description">Description *</label>
                <textarea
                  id="meta-description"
                  value={metadata.description}
                  onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                  placeholder="Enter a brief description or excerpt"
                  className="metadata-textarea"
                  rows="4"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="editor-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Editor and Preview */}
      <div className={`editor-container view-${viewMode}`}>
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className="editor-pane" style={{ width: viewMode === 'split' ? `${paneSize}%` : '100%' }}>
            <textarea
              className="markdown-textarea"
              value={content}
              onChange={handleContentChange}
              placeholder="Write your markdown content here..."
              spellCheck="true"
            />
          </div>
        )}

        {viewMode === 'split' && (
          <div className="pane-divider" />
        )}

        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="preview-pane" style={{ width: viewMode === 'split' ? `${100 - paneSize}%` : '100%' }}>
            <MarkdownPreview content={content} category={category} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;
