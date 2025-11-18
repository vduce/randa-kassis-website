import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CategorySelector from './CategorySelector';
import FileList from './FileList';
import ConfirmDialog from './ConfirmDialog';
import FileUpload from './FileUpload';
import { deleteFile } from '../../services/unifiedFileOperations';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showUpload, setShowUpload] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSelectFile = (file) => {
    // Navigate to editor with file data
    navigate('/admin/editor', {
      state: {
        category: selectedCategory,
        file: file,
        mode: 'edit'
      }
    });
  };

  const handleAddNew = () => {
    // Navigate to editor for new file
    navigate('/admin/editor', {
      state: {
        category: selectedCategory,
        mode: 'create'
      }
    });
  };

  const handleDeleteFile = (file) => {
    // Show delete confirmation dialog
    setFileToDelete(file);
  };

  const handleConfirmDelete = async () => {
    if (!fileToDelete || !selectedCategory) return;

    setDeleteLoading(true);

    try {
      const result = await deleteFile(selectedCategory.path, fileToDelete.name);

      if (result.success) {
        // Close dialog
        setFileToDelete(null);
        // Trigger file list refresh
        setRefreshTrigger(prev => prev + 1);
        // Show success notification (will be implemented in task 8)
        console.log('File deleted successfully');
      } else {
        // Show error notification
        alert(`Failed to delete file: ${result.error.message}`);
      }
    } catch (error) {
      alert('An unexpected error occurred while deleting the file.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    if (!deleteLoading) {
      setFileToDelete(null);
    }
  };

  const handleUploadComplete = (result) => {
    // Close upload modal
    setShowUpload(false);
    
    // Refresh file list
    setRefreshTrigger(prev => prev + 1);
    
    // Show success notification (will be implemented in task 8)
    if (result.success) {
      console.log(`Successfully uploaded ${result.summary.successful} file(s)`);
    } else {
      console.log(`Upload completed: ${result.summary.successful} successful, ${result.summary.failed} failed`);
    }
  };

  // Listen for upload button clicks from FileList
  useEffect(() => {
    const handleOpenUpload = () => {
      if (selectedCategory) {
        setShowUpload(true);
      }
    };

    window.addEventListener('openFileUpload', handleOpenUpload);
    return () => window.removeEventListener('openFileUpload', handleOpenUpload);
  }, [selectedCategory]);

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <div className="header-left">
            <button 
              className="sidebar-toggle" 
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? '✕' : '☰'}
            </button>
            <h1>Content Management</h1>
          </div>
          <div className="header-right">
            <span className="user-email">{user?.email}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-body">
        {/* Mobile backdrop overlay */}
        {isSidebarOpen && (
          <div 
            className="sidebar-backdrop" 
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}
        
        {/* Sidebar */}
        <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-content">
            <div className="sidebar-header">
              <h2>Content Categories</h2>
            </div>
            <CategorySelector 
              selectedCategory={selectedCategory}
              onSelectCategory={(category) => {
                setSelectedCategory(category);
                // Close sidebar on mobile after selection
                if (window.innerWidth <= 768) {
                  setIsSidebarOpen(false);
                }
              }}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {!selectedCategory ? (
            <div className="welcome-section">
              <div className="welcome-card">
                <h2>Welcome, {user?.name}!</h2>
                <p>Select a content category from the sidebar to get started.</p>
                
                <div className="quick-info">
                  <div className="info-item">
                    <span className="info-icon">📝</span>
                    <div className="info-text">
                      <h3>Manage Content</h3>
                      <p>Create, edit, and delete markdown files across all categories</p>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-icon">👁️</span>
                    <div className="info-text">
                      <h3>Live Preview</h3>
                      <p>See real-time preview of your markdown content as you type</p>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-icon">💾</span>
                    <div className="info-text">
                      <h3>Auto-Save</h3>
                      <p>Your work is automatically saved to prevent data loss</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="category-content">
              <div className="content-header">
                <div className="breadcrumb">
                  <span className="breadcrumb-item">Dashboard</span>
                  <span className="breadcrumb-separator">/</span>
                  <span className="breadcrumb-item active">{selectedCategory.label}</span>
                </div>
                <h2>{selectedCategory.label}</h2>
                <p>Manage your {selectedCategory.label.toLowerCase()} content</p>
              </div>
              
              <FileList
                category={selectedCategory}
                onSelectFile={handleSelectFile}
                onDeleteFile={handleDeleteFile}
                onAddNew={handleAddNew}
                refreshTrigger={refreshTrigger}
              />
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!fileToDelete}
        title="Delete File"
        message={`Are you sure you want to delete "${fileToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={deleteLoading}
        danger={true}
      />

      {/* File Upload Modal */}
      {showUpload && selectedCategory && (
        <FileUpload
          category={selectedCategory}
          onUploadComplete={handleUploadComplete}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
