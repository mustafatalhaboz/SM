'use client';

import { TranscriptDisplayProps } from '@/types/voice';

/**
 * Component for displaying real-time transcript during voice recording
 */
export function TranscriptDisplay({
  transcript,
  interimTranscript,
  isRecording,
  isVisible,
  confidence = 0,
  onClose
}: TranscriptDisplayProps) {
  
  if (!isVisible) {
    return null;
  }

  const hasContent = transcript.trim() || interimTranscript.trim();
  const confidencePercentage = Math.round(confidence * 100);

  return (
    <div className={`
      fixed bottom-0 left-0 right-0 z-40
      transform transition-all duration-300 ease-in-out
      ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
    `}>
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              {/* Recording indicator */}
              <div className={`
                flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium
                ${isRecording 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-blue-100 text-blue-700'
                }
              `}>
                {isRecording && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
                <span>
                  {isRecording ? 'Dinleniyor...' : 'İşleniyor...'}
                </span>
              </div>

              {/* Confidence indicator */}
              {confidence > 0 && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                  </svg>
                  <span>%{confidencePercentage} güvenilir</span>
                </div>
              )}
            </div>

            {/* Close button */}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Kapat"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          {/* Transcript content */}
          <div className="min-h-[2rem]">
            {hasContent ? (
              <div className="space-y-1">
                {/* Final transcript */}
                {transcript && (
                  <p className="text-gray-900 text-base leading-relaxed">
                    {transcript}
                  </p>
                )}
                
                {/* Interim transcript (currently being processed) */}
                {interimTranscript && (
                  <p className="text-gray-500 text-base leading-relaxed italic">
                    {interimTranscript}
                    <span className="animate-pulse">|</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-4">
                <div className="text-gray-400 text-sm flex items-center space-x-2">
                  <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  <span>Konuşmaya başlayın...</span>
                </div>
              </div>
            )}
          </div>

          {/* Audio visualization bars */}
          {isRecording && (
            <div className="flex items-center justify-center space-x-1 mt-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`
                    w-1 bg-red-400 rounded-full
                    animate-pulse
                  `}
                  style={{
                    height: `${Math.random() * 16 + 8}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${0.5 + Math.random() * 0.5}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile-specific adjustments */}
      <style jsx>{`
        @media (max-width: 640px) {
          .transcript-content {
            font-size: 0.875rem;
            line-height: 1.375;
          }
        }
      `}</style>
    </div>
  );
}