import { 
  VoiceErrorType, 
  VoiceError, 
  SpeechRecognitionConfig, 
  DEFAULT_SPEECH_CONFIG,
  VOICE_ERROR_MESSAGES 
} from '@/types/voice';

// Browser Speech Recognition API types
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  
  start(): void;
  stop(): void;
  abort(): void;
}

declare const SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};


// Extend Window interface for browser speech recognition APIs
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}


/**
 * Detects if speech recognition is supported in the current browser
 */
export function isSpeechRecognitionSupported(): boolean {
  // Ensure we're in a browser environment
  if (typeof window === 'undefined') {
    return false;
  }
  
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Creates a speech recognition instance with browser compatibility
 */
export function createSpeechRecognition(): SpeechRecognition | null {
  if (!isSpeechRecognitionSupported()) {
    return null;
  }

  // Try webkit (Chrome/Edge) first, then standard (Firefox/Safari)
  const SpeechRecognitionClass = window.webkitSpeechRecognition || window.SpeechRecognition;
  return new SpeechRecognitionClass();
}

/**
 * Configures speech recognition instance with provided settings
 */
export function configureSpeechRecognition(
  recognition: SpeechRecognition,
  config: Partial<SpeechRecognitionConfig> = {}
): void {
  const finalConfig = { ...DEFAULT_SPEECH_CONFIG, ...config };
  
  recognition.continuous = finalConfig.continuous;
  recognition.interimResults = finalConfig.interimResults;
  recognition.lang = finalConfig.language;
  recognition.maxAlternatives = finalConfig.maxAlternatives;
}

/**
 * Checks if microphone permission is granted
 */
export async function checkMicrophonePermission(): Promise<boolean> {
  if (!navigator.permissions) {
    return false; // Cannot check permissions
  }

  try {
    const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    return permission.state === 'granted';
  } catch (error) {
    console.warn('Could not check microphone permission:', error);
    return false;
  }
}

/**
 * Requests microphone permission from the user
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  if (!navigator.mediaDevices?.getUserMedia) {
    return false;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop the stream immediately as we only needed permission
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.warn('Microphone permission denied:', error);
    return false;
  }
}

/**
 * Converts SpeechRecognitionError to our VoiceError type
 */
export function mapSpeechRecognitionError(error: SpeechRecognitionErrorEvent): VoiceError {
  let errorType: VoiceErrorType;
  let recoverable = true;

  switch (error.error) {
    case 'not-allowed':
    case 'permission-denied':
      errorType = VoiceErrorType.PERMISSION_DENIED;
      recoverable = false;
      break;
    case 'network':
      errorType = VoiceErrorType.NETWORK_ERROR;
      break;
    case 'no-speech':
      errorType = VoiceErrorType.NO_SPEECH;
      break;
    case 'audio-capture':
    case 'service-not-allowed':
      errorType = VoiceErrorType.AUDIO_CAPTURE;
      break;
    default:
      errorType = VoiceErrorType.UNKNOWN;
  }

  return {
    type: errorType,
    message: VOICE_ERROR_MESSAGES[errorType],
    recoverable
  };
}

/**
 * Extracts transcript text from speech recognition results
 * Uses resultIndex to process only new results, preventing duplication
 */
export function extractTranscriptFromResults(
  results: SpeechRecognitionResultList,
  resultIndex: number = 0
): {
  finalTranscript: string;
  interimTranscript: string;
  confidence: number;
} {
  let finalTranscript = '';
  let interimTranscript = '';
  let maxConfidence = 0;

  // Process only NEW results starting from resultIndex to prevent duplication
  for (let i = resultIndex; i < results.length; i++) {
    const result = results[i];
    if (!result || result.length === 0) continue;
    
    const alternative = result[0];
    if (!alternative) continue;
    
    const transcript = alternative.transcript;
    const confidence = alternative.confidence || 0;

    if (result.isFinal) {
      finalTranscript += transcript;
      maxConfidence = Math.max(maxConfidence, confidence);
    } else {
      interimTranscript += transcript;
    }
  }

  return {
    finalTranscript: finalTranscript.trim(),
    interimTranscript: interimTranscript.trim(),
    confidence: maxConfidence
  };
}

/**
 * Utility class for managing speech recognition lifecycle
 */
export class SpeechRecognitionManager {
  private recognition: SpeechRecognition | null = null;
  private isRecording = false;

  constructor() {
    this.recognition = createSpeechRecognition();
  }

  /**
   * Checks if speech recognition is available
   */
  isSupported(): boolean {
    return this.recognition !== null;
  }

  /**
   * Starts speech recognition with event handlers
   */
  async start(
    config: Partial<SpeechRecognitionConfig>,
    handlers: {
      onResult?: (finalTranscript: string, interimTranscript: string, confidence: number) => void;
      onError?: (error: VoiceError) => void;
      onStart?: () => void;
      onEnd?: () => void;
    }
  ): Promise<void> {
    if (!this.recognition || this.isRecording) {
      return;
    }

    // Check and request microphone permission
    const hasPermission = await checkMicrophonePermission();
    if (!hasPermission) {
      const granted = await requestMicrophonePermission();
      if (!granted) {
        handlers.onError?.({
          type: VoiceErrorType.PERMISSION_DENIED,
          message: VOICE_ERROR_MESSAGES[VoiceErrorType.PERMISSION_DENIED],
          recoverable: false
        });
        return;
      }
    }

    // Configure recognition
    configureSpeechRecognition(this.recognition, config);

    // Set up event handlers
    this.recognition.onstart = () => {
      this.isRecording = true;
      handlers.onStart?.();
    };

    this.recognition.onend = () => {
      this.isRecording = false;
      handlers.onEnd?.();
    };

    this.recognition.onerror = (event) => {
      const error = mapSpeechRecognitionError(event);
      handlers.onError?.(error);
    };

    this.recognition.onresult = (event) => {
      const { finalTranscript, interimTranscript, confidence } = extractTranscriptFromResults(
        event.results, 
        event.resultIndex
      );
      
      // Debug logging to track transcript processing
      if (finalTranscript || interimTranscript) {
        console.log('🎤 Speech Result:', {
          resultIndex: event.resultIndex,
          totalResults: event.results.length,
          finalText: finalTranscript,
          interimText: interimTranscript,
          confidence
        });
      }
      
      handlers.onResult?.(finalTranscript, interimTranscript, confidence);
    };

    try {
      this.recognition.start();
    } catch (err) {
      handlers.onError?.({
        type: VoiceErrorType.AUDIO_CAPTURE,
        message: VOICE_ERROR_MESSAGES[VoiceErrorType.AUDIO_CAPTURE],
        recoverable: true
      });
    }
  }

  /**
   * Stops speech recognition
   */
  stop(): void {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
    }
  }

  /**
   * Aborts speech recognition immediately
   */
  abort(): void {
    if (this.recognition && this.isRecording) {
      this.recognition.abort();
    }
  }

  /**
   * Gets current recording status
   */
  getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Cleanup method for component unmounting
   */
  cleanup(): void {
    if (this.recognition) {
      this.abort();
      this.recognition.onstart = null;
      this.recognition.onend = null;
      this.recognition.onerror = null;
      this.recognition.onresult = null;
    }
  }
}