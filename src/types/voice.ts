// Voice recording status types
export type VoiceStatus = 
  | 'idle'                    // Not recording, ready to start
  | 'requesting-permission'   // Asking for microphone access
  | 'recording'              // Currently recording speech
  | 'processing'             // Processing speech recognition
  | 'editing'                // User editing transcript
  | 'confirmed';             // Transcript confirmed by user

// Voice error types for different failure scenarios
export enum VoiceErrorType {
  NOT_SUPPORTED = 'not-supported',
  PERMISSION_DENIED = 'permission-denied',
  NETWORK_ERROR = 'network-error',
  NO_SPEECH = 'no-speech',
  AUDIO_CAPTURE = 'audio-capture',
  UNKNOWN = 'unknown'
}

// Voice error interface
export interface VoiceError {
  type: VoiceErrorType;
  message: string;
  recoverable: boolean;
}

// Supported languages for speech recognition
export type VoiceLanguage = 'tr-TR' | 'en-US';

// Transcript data structure
export interface TranscriptData {
  final: string;      // Finalized speech recognition results
  interim: string;    // Currently being processed speech
  edited: string;     // User-edited version of transcript
}

// Main voice recorder state interface
export interface VoiceRecorderState {
  status: VoiceStatus;
  transcript: TranscriptData;
  error: VoiceError | null;
  confidence: number;
  isSupported: boolean;
  hasPermission: boolean;
  language: VoiceLanguage;
}

// Speech recognition result interface (extending browser API)
export interface VoiceSpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

// Speech recognition configuration
export interface SpeechRecognitionConfig {
  language: VoiceLanguage;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

// Props for VoiceRecorder component
export interface VoiceRecorderProps {
  onTranscriptConfirmed?: (text: string) => void;
  className?: string;
  disabled?: boolean;
  language?: VoiceLanguage;
}

// Props for TranscriptDisplay component
export interface TranscriptDisplayProps {
  transcript: string;
  interimTranscript: string;
  isRecording: boolean;
  isVisible: boolean;
  confidence?: number;
  onClose?: () => void;
}

// Props for ConfirmationDialog component
export interface ConfirmationDialogProps {
  transcript: string;
  isOpen: boolean;
  onEdit: (text: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onRetry: () => void;
}

// Hook return type for useVoiceRecorder
export interface UseVoiceRecorderReturn {
  state: VoiceRecorderState;
  actions: {
    startRecording: () => void;
    stopRecording: () => void;
    cancelRecording: () => void;
    confirmTranscript: () => void;
    editTranscript: (text: string) => void;
    retryRecording: () => void;
    clearError: () => void;
  };
}

// Default configuration values
export const DEFAULT_SPEECH_CONFIG: SpeechRecognitionConfig = {
  language: 'tr-TR',
  continuous: true,
  interimResults: true,
  maxAlternatives: 1
};

// Error messages in Turkish
export const VOICE_ERROR_MESSAGES: Record<VoiceErrorType, string> = {
  [VoiceErrorType.NOT_SUPPORTED]: 'Tarayıcınız ses tanıma özelliğini desteklemiyor',
  [VoiceErrorType.PERMISSION_DENIED]: 'Mikrofon erişimi reddedildi',
  [VoiceErrorType.NETWORK_ERROR]: 'Ağ bağlantısı hatası',
  [VoiceErrorType.NO_SPEECH]: 'Ses algılanamadı, lütfen tekrar deneyin',
  [VoiceErrorType.AUDIO_CAPTURE]: 'Ses kaydı başlatılamadı',
  [VoiceErrorType.UNKNOWN]: 'Bilinmeyen hata oluştu'
};