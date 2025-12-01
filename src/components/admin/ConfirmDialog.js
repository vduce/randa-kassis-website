import React from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({ 
  open, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  onConfirm, 
  onCancel,
  loading = false,
  danger = false
}) => {
  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onCancel();
    }
  };

  return (
    <div className="confirm-dialog-backdrop" onClick={handleBackdropClick}>
      <div className="confirm-dialog">
        <div className="confirm-dialog-header">
          <h3>{title}</h3>
        </div>
        
        <div className="confirm-dialog-body">
          <p>{message}</p>
        </div>
        
        <div className="confirm-dialog-footer">
          <button
            className="dialog-button cancel-button"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className={`dialog-button confirm-button ${danger ? 'danger' : ''}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
