import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  VoiceRecorderState, 
  UseVoiceRecorderReturn, 
  VoiceLanguage,
  VoiceError,
  VoiceErrorType,
  VOICE_ERROR_MESSAGES
} from '@/types/voice';
import { 
  SpeechRecognitionManager,
  isSpeechRecognitionSupported,
  checkMicrophonePermission
} from '@/lib/speechRecognition';

/**
 * Custom hook for managing voice recording state and operations
 */
export function useVoiceRecorder(
  language: VoiceLanguage = 'tr-TR'
): UseVoiceRecorderReturn {
  
  // Speech recognition manager instance
  const speechManagerRef = useRef<SpeechRecognitionManager | null>(null);
  
  // Initialize the speech manager
  useEffect(() => {
    speechManagerRef.current = new SpeechRecognitionManager();
    return () => {
      speechManagerRef.current?.cleanup();
    };
  }, []);

  // Main voice recorder state
  const [state, setState] = useState<VoiceRecorderState>(() => ({
    status: 'idle',
    transcript: {
      final: '',
      interim: '',
      edited: ''
    },
    error: null,
    confidence: 0,
    // Prevent hydration issues by checking if window exists
    isSupported: typeof window !== 'undefined' ? isSpeechRecognitionSupported() : false,
    hasPermission: false,
    language
  }));

  // Check microphone permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      const hasPermission = await checkMicrophonePermission();
      setState(prev => ({ ...prev, hasPermission }));
    };
    checkPermission();
  }, []);

  /**
   * Updates the transcript data
   * Now handles incremental updates properly to prevent duplication
   */
  const updateTranscript = useCallback((
    finalText: string, 
    interimText: string, 
    confidence: number
  ) => {
    setState(prev => {
      const newFinal = finalText ? prev.transcript.final + finalText : prev.transcript.final;
      
      // Debug logging to track state updates
      console.log('📝 Transcript Update:', {
        prevFinal: prev.transcript.final,
        newFinalText: finalText,
        resultingFinal: newFinal,
        interim: interimText,
        confidence
      });
      
      return {
        ...prev,
        transcript: {
          ...prev.transcript,
          // Only append NEW final text to prevent duplication
          final: newFinal,
          // Interim text is always replaced, not appended
          interim: interimText
        },
        confidence,
        error: null
      };
    });
  }, []);

  /**
   * Sets an error state
   */
  const setError = useCallback((error: VoiceError) => {
    setState(prev => ({
      ...prev,
      error,
      status: 'idle'
    }));
  }, []);

  /**
   * Clears the current error
   */
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  /**
   * Starts voice recording
   */
  const startRecording = useCallback(async () => {
    const speechManager = speechManagerRef.current;
    
    if (!speechManager || !state.isSupported) {
      setError({
        type: VoiceErrorType.NOT_SUPPORTED,
        message: VOICE_ERROR_MESSAGES[VoiceErrorType.NOT_SUPPORTED],
        recoverable: false
      });
      return;
    }

    if (state.status === 'recording') {
      return; // Already recording
    }

    // Clear previous transcript and error
    setState(prev => ({
      ...prev,
      status: 'requesting-permission',
      transcript: { final: '', interim: '', edited: '' },
      error: null,
      confidence: 0
    }));

    try {
      await speechManager.start(
        { language },
        {
          onStart: () => {
            setState(prev => ({ 
              ...prev, 
              status: 'recording',
              hasPermission: true
            }));
          },
          
          onResult: (finalTranscript, interimTranscript, confidence) => {
            updateTranscript(finalTranscript, interimTranscript, confidence);
          },
          
          onError: (error) => {
            setError(error);
            if (error.type === VoiceErrorType.PERMISSION_DENIED) {
              setState(prev => ({ ...prev, hasPermission: false }));
            }
          },
          
          onEnd: () => {
            setState(prev => {
              // Only move to editing if we have transcript content
              const hasContent = prev.transcript.final.trim() || prev.transcript.interim.trim();
              return {
                ...prev,
                status: hasContent ? 'editing' : 'idle',
                transcript: {
                  ...prev.transcript,
                  // Move interim to final when recording ends
                  final: prev.transcript.final + prev.transcript.interim,
                  interim: '',
                  edited: prev.transcript.final + prev.transcript.interim
                }
              };
            });
          }
        }
      );
    } catch (err) {
      setError({
        type: VoiceErrorType.UNKNOWN,
        message: VOICE_ERROR_MESSAGES[VoiceErrorType.UNKNOWN],
        recoverable: true
      });
    }
  }, [state.isSupported, state.status, language, updateTranscript, setError]);

  /**
   * Stops voice recording
   */
  const stopRecording = useCallback(() => {
    const speechManager = speechManagerRef.current;
    
    if (speechManager && state.status === 'recording') {
      setState(prev => ({ ...prev, status: 'processing' }));
      speechManager.stop();
    }
  }, [state.status]);

  /**
   * Cancels voice recording and resets state
   */
  const cancelRecording = useCallback(() => {
    const speechManager = speechManagerRef.current;
    
    if (speechManager) {
      speechManager.abort();
    }

    setState(prev => ({
      ...prev,
      status: 'idle',
      transcript: { final: '', interim: '', edited: '' },
      error: null,
      confidence: 0
    }));
  }, []);

  /**
   * Confirms the transcript (final step)
   */
  const confirmTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'confirmed'
    }));
  }, []);

  /**
   * Edits the transcript text
   */
  const editTranscript = useCallback((text: string) => {
    setState(prev => ({
      ...prev,
      transcript: {
        ...prev.transcript,
        edited: text
      }
    }));
  }, []);

  /**
   * Retries recording (clears state and starts again)
   */
  const retryRecording = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'idle',
      transcript: { final: '', interim: '', edited: '' },
      error: null,
      confidence: 0
    }));
    
    // Small delay to ensure state is updated
    setTimeout(() => {
      startRecording();
    }, 100);
  }, [startRecording]);

  // Return the hook interface
  return {
    state,
    actions: {
      startRecording,
      stopRecording,
      cancelRecording,
      confirmTranscript,
      editTranscript,
      retryRecording,
      clearError
    }
  };
}