'use client';

import { useState, useEffect } from 'react';
import { ConfirmationDialogProps } from '@/types/voice';

/**
 * Dialog component for confirming and editing voice transcript
 */
export function ConfirmationDialog({
  transcript,
  isOpen,
  onEdit,
  onConfirm,
  onCancel,
  onRetry
}: ConfirmationDialogProps) {
  
  const [editedText, setEditedText] = useState(transcript);

  // Update local state when transcript changes
  useEffect(() => {
    setEditedText(transcript);
  }, [transcript]);

  // Update parent when local text changes
  useEffect(() => {
    onEdit(editedText);
  }, [editedText, onEdit]);

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    if (editedText.trim()) {
      onConfirm();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full max-w-lg">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Ses Kaydı Onayı
              </h3>
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Metni düzenleyebilir ve onaylayabilirsiniz
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="transcript-edit" className="block text-sm font-medium text-gray-700 mb-2">
                  Algılanan Metin:
                </label>
                <textarea
                  id="transcript-edit"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="
                    w-full px-3 py-3 
                    border border-gray-300 rounded-md 
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    resize-none text-base leading-relaxed
                  "
                  rows={4}
                  placeholder="Ses kaydından çıkarılan metin burada görünecek..."
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ctrl+Enter ile onaylayın, Escape ile iptal edin
                </p>
              </div>

              {/* Character count */}
              <div className="text-xs text-gray-400 text-right">
                {editedText.length} karakter
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between space-x-3">
              {/* Secondary actions */}
              <div className="flex space-x-2">
                <button
                  onClick={onRetry}
                  className="
                    px-3 py-2 text-sm font-medium text-blue-600 
                    hover:text-blue-800 transition-colors
                    flex items-center space-x-1
                  "
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  <span>Tekrar Kaydet</span>
                </button>
              </div>

              {/* Primary actions */}
              <div className="flex space-x-3">
                <button
                  onClick={onCancel}
                  className="
                    px-4 py-2 text-sm font-medium text-gray-700 
                    bg-white border border-gray-300 rounded-md
                    hover:bg-gray-50 focus:outline-none focus:ring-2 
                    focus:ring-offset-2 focus:ring-blue-500
                    transition-colors
                  "
                >
                  İptal
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!editedText.trim()}
                  className="
                    px-4 py-2 text-sm font-medium text-white 
                    bg-blue-600 border border-transparent rounded-md
                    hover:bg-blue-700 focus:outline-none focus:ring-2 
                    focus:ring-offset-2 focus:ring-blue-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                  "
                >
                  Onayla
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}