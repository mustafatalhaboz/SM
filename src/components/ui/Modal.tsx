'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { logger } from '@/lib/logger';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ isOpen, onClose, children, title, size = 'md' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Development logging
  logger.componentRender('Modal', { isOpen, title, size });

  // Size classes for different modal sizes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  // Body scroll lock effect
  useEffect(() => {
    if (isOpen) {
      // Store currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      
      // Focus the modal when it opens
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
      
      // Restore focus to previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }

    // Cleanup on unmount or when modal closes
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // ESC key handler
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Shift + Tab (backward)
          if (document.activeElement === firstFocusable) {
            event.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          // Tab (forward)
          if (document.activeElement === lastFocusable) {
            event.preventDefault();
            firstFocusable?.focus();
          }
        }
      }
    };

    modal.addEventListener('keydown', handleTabKey);
    return () => modal.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Don't render anything if modal is not open
  if (!isOpen) {
    return null;
  }

  // Portal the modal to document.body
  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-red-500"
      onClick={handleOverlayClick}
      style={{ zIndex: 9999 }}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />
      
      {/* Modal Content */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        tabIndex={-1}
        className={`
          relative bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]}
          max-h-[90vh] overflow-hidden
          transform transition-all duration-300 ease-out
          animate-in fade-in-0 zoom-in-95
        `}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b">
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Modalı kapat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Close button (when no title) */}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            aria-label="Modalı kapat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Body */}
        <div className={`overflow-y-auto ${title ? 'p-6' : 'p-6 pt-12'}`}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}