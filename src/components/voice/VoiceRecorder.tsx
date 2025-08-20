'use client';

import { useEffect, useState } from 'react';
import { VoiceRecorderProps } from '@/types/voice';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { TranscriptDisplay } from './TranscriptDisplay';
import { ConfirmationDialog } from './ConfirmationDialog';

/**
 * Main voice recorder component with fixed microphone button
 */
export function VoiceRecorder({
  onTranscriptConfirmed,
  className = '',
  disabled = false,
  language = 'tr-TR'
}: VoiceRecorderProps) {
  // Prevent hydration mismatch by only rendering on client side
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { state, actions } = useVoiceRecorder(language);

  // Handle transcript confirmation
  useEffect(() => {
    if (state.status === 'confirmed' && onTranscriptConfirmed) {
      const transcript = state.transcript.edited || state.transcript.final;
      if (transcript.trim()) {
        onTranscriptConfirmed(transcript.trim());
      }
    }
  }, [state.status, state.transcript, onTranscriptConfirmed]);

  // Don't render anything during SSR to prevent hydration mismatch
  // Also don't render if not supported
  if (!isMounted || !state.isSupported) {
    return null;
  }

  const isRecording = state.status === 'recording';
  const isProcessing = state.status === 'processing';
  const isRequestingPermission = state.status === 'requesting-permission';
  const isEditing = state.status === 'editing';

  const handleButtonClick = () => {
    if (disabled) return;

    if (isRecording) {
      actions.stopRecording();
    } else if (state.status === 'idle') {
      actions.startRecording();
    }
  };

  const getButtonIcon = () => {
    if (isRequestingPermission) {
      return (
        <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
        </svg>
      );
    }

    if (isRecording) {
      return (
        <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    }

    if (isProcessing) {
      return (
        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    }

    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
      </svg>
    );
  };

  const getButtonColor = () => {
    if (disabled) return 'bg-gray-400 hover:bg-gray-400';
    if (isRecording) return 'bg-red-500 hover:bg-red-600';
    if (isRequestingPermission) return 'bg-yellow-500 hover:bg-yellow-600';
    if (isProcessing) return 'bg-blue-500 hover:bg-blue-600';
    return 'bg-green-500 hover:bg-green-600';
  };

  const getButtonTitle = () => {
    if (disabled) return 'Ses kaydı devre dışı';
    if (isRecording) return 'Kaydı durdur';
    if (isRequestingPermission) return 'Mikrofon izni isteniyor...';
    if (isProcessing) return 'İşleniyor...';
    return 'Ses kaydını başlat';
  };

  return (
    <>
      {/* Fixed microphone button */}
      <button
        onClick={handleButtonClick}
        disabled={disabled || isProcessing || isRequestingPermission}
        title={getButtonTitle()}
        className={`
          fixed bottom-6 right-6 z-50
          w-12 h-12 rounded-full
          ${getButtonColor()}
          text-white shadow-lg
          transition-all duration-200 ease-in-out
          hover:scale-110 active:scale-95
          disabled:cursor-not-allowed disabled:opacity-50
          ${className}
        `}
      >
        {getButtonIcon()}
      </button>

      {/* Real-time transcript display */}
      <TranscriptDisplay
        transcript={state.transcript.final}
        interimTranscript={state.transcript.interim}
        isRecording={isRecording}
        isVisible={isRecording || isProcessing || (state.transcript.final + state.transcript.interim).trim().length > 0}
        confidence={state.confidence}
        onClose={actions.cancelRecording}
      />

      {/* Confirmation dialog */}
      <ConfirmationDialog
        transcript={state.transcript.edited || state.transcript.final}
        isOpen={isEditing}
        onEdit={actions.editTranscript}
        onConfirm={actions.confirmTranscript}
        onCancel={actions.cancelRecording}
        onRetry={actions.retryRecording}
      />

      {/* Error display */}
      {state.error && (
        <div className="fixed bottom-20 right-6 z-40 max-w-sm">
          <div className="bg-red-500 text-white p-3 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{state.error.message}</span>
              </div>
              <button
                onClick={actions.clearError}
                className="ml-2 text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            {state.error.recoverable && (
              <button
                onClick={actions.retryRecording}
                className="mt-2 text-xs underline hover:no-underline"
              >
                Tekrar dene
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}