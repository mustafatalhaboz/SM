import { TaskStatus, TaskType, TaskPriority, TaskDuration, TaskWithProject, Task } from '@/lib/types';

// Agent processing status
export type AgentStatus = 
  | 'idle'                    // Not processing
  | 'analyzing'               // AI analyzing transcript
  | 'creating'                // Creating task in Firebase
  | 'awaiting-confirmation'   // Waiting for user to confirm uncertain match
  | 'completed'               // Task created successfully
  | 'error';                  // Processing failed

// Agent error types
export enum AgentErrorType {
  OPENAI_API_ERROR = 'openai-api-error',
  PARSING_ERROR = 'parsing-error',
  VALIDATION_ERROR = 'validation-error', 
  FIREBASE_ERROR = 'firebase-error',
  PROJECT_NOT_FOUND = 'project-not-found',
  NETWORK_ERROR = 'network-error',
  UNKNOWN = 'unknown'
}

// Agent error interface
export interface AgentError {
  type: AgentErrorType;
  message: string;
  details?: string;
  recoverable: boolean;
}

// Input for transcript analysis
export interface TranscriptAnalysisRequest {
  transcript: string;
  availableProjects: Array<{
    id: string;
    name: string;
  }>;
}

// Command types for AI agent operations
export type CommandType = 'CREATE' | 'UPDATE' | 'COMPLETE';

// Task identification for update operations
export interface TaskIdentification {
  projectName: string;
  taskName: string;
  taskId?: string; // Resolved after search
}

// Fields that can be updated in a task
export interface UpdateFields {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  estimatedDuration?: TaskDuration;
  deadline?: string; // ISO date string
  assignedPerson?: string;
}

// Raw AI response structure (from OpenAI) - enhanced for commands
export interface AITaskResponse {
  commandType: CommandType;
  // CREATE command fields
  title?: string;
  description?: string;
  projectName?: string;
  projectId?: string;
  assignedPerson?: string;
  status?: TaskStatus;
  type?: TaskType;
  priority?: TaskPriority;
  estimatedDuration?: TaskDuration;
  deadline?: string; // ISO date string or Turkish date
  // UPDATE command fields
  taskIdentification?: TaskIdentification;
  updateFields?: UpdateFields;
  confidence: number; // 0-1 confidence score
}

// Processed task data ready for Firebase
export interface ProcessedTaskData {
  projectId: string;
  title: string;
  description: string;
  assignedPerson: string;
  status: TaskStatus;
  type: TaskType;
  priority: TaskPriority;
  estimatedDuration: TaskDuration;
  deadline: Date;
  confidence: number;
  projectName: string; // For user feedback
}

// API response version with serialized date
export interface ProcessedTaskDataAPI {
  projectId: string;
  title: string;
  description: string;
  assignedPerson: string;
  status: TaskStatus;
  type: TaskType;
  priority: TaskPriority;
  estimatedDuration: TaskDuration;
  deadline: string; // ISO date string (serialized)
  confidence: number;
  projectName: string; // For user feedback
}

// Forward declaration for search results (to avoid circular imports)
export interface TaskSearchResult {
  task: Task;
  projectName: string;
  confidence: number; // 0-100 confidence score
  matchType: 'exact' | 'case-insensitive' | 'typo-corrected' | 'partial' | 'fuzzy';
  matchDetails?: {
    score: number;
    type: 'exact' | 'case-insensitive' | 'typo-corrected' | 'partial' | 'fuzzy';
    reasons: string[];
  };
}

// Processed command result (forward declaration)
export interface ProcessedCommandResult {
  commandType: CommandType;
  createData?: ProcessedTaskData;
  updateData?: {
    taskIdentification: TaskIdentification;
    updateFields: UpdateFields;
  };
  completeData?: {
    taskIdentification: TaskIdentification;
  };
}

// Task match confirmation data for uncertain matches
export interface TaskMatchConfirmation {
  searchTerm: string;
  commandType: CommandType;
  commandData: ProcessedCommandResult;
  possibleMatches: TaskSearchResult[];
  topMatch?: TaskSearchResult;
  needsDisambiguation: boolean;
  needsConfirmation: boolean;
}

// Enhanced agent processing result for both CREATE and UPDATE
export interface AgentResult {
  success: boolean;
  commandType: CommandType;
  // CREATE result
  taskData?: ProcessedTaskData;
  taskId?: string; // Firebase task ID if successful
  // UPDATE result
  updatedTask?: {
    taskId: string;
    taskTitle: string;
    projectName: string;
    updatedFields: UpdateFields;
  };
  // COMPLETE result
  completedTask?: {
    taskId: string;
    taskTitle: string;
    projectName: string;
  };
  // Confirmation needed
  needsUserConfirmation?: boolean;
  confirmationData?: TaskMatchConfirmation;
  error?: AgentError;
}

// State for task agent hook
export interface TaskAgentState {
  status: AgentStatus;
  currentTranscript: string;
  result: AgentResult | null;
  error: AgentError | null;
}

// Props for useTaskAgent hook
export interface UseTaskAgentOptions {
  onSuccess?: (result: AgentResult) => void;
  onError?: (error: AgentError) => void;
}

// Return type for useTaskAgent hook
export interface UseTaskAgentReturn {
  state: TaskAgentState;
  actions: {
    analyzeAndCreateTask: (transcript: string, availableProjects: Array<{id: string; name: string}>, availableTasks?: TaskWithProject[]) => Promise<void>;
    analyzeAndExecuteCommand: (transcript: string, availableProjects: Array<{id: string; name: string}>, availableTasks?: TaskWithProject[]) => Promise<void>;
    confirmTaskMatch: (selectedMatch: TaskSearchResult) => Promise<void>;
    rejectAndDisambiguate: () => void;
    createNewTask: () => Promise<void>;
    reset: () => void;
    retryLastAnalysis: () => Promise<void>;
  };
}

// API request/response types
export interface AnalyzeTranscriptRequest {
  transcript: string;
  projects: Array<{
    id: string;
    name: string;
  }>;
}

export interface AnalyzeTranscriptResponse {
  success: boolean;
  data?: ProcessedTaskDataAPI; // Use API version with string date
  error?: {
    type: AgentErrorType;
    message: string;
    details?: string;
  };
}

// Error messages in Turkish
export const AGENT_ERROR_MESSAGES: Record<AgentErrorType, string> = {
  [AgentErrorType.OPENAI_API_ERROR]: 'AI servisi hatası - lütfen tekrar deneyin',
  [AgentErrorType.PARSING_ERROR]: 'Metin analizi başarısız - lütfen daha açık konuşun',
  [AgentErrorType.VALIDATION_ERROR]: 'Çıkarılan veri geçersiz - lütfen görev detaylarını kontrol edin',
  [AgentErrorType.FIREBASE_ERROR]: 'Görev kaydetme hatası - lütfen bağlantınızı kontrol edin',
  [AgentErrorType.PROJECT_NOT_FOUND]: 'Proje bulunamadı - lütfen mevcut proje ismi belirtin',
  [AgentErrorType.NETWORK_ERROR]: 'Ağ bağlantısı hatası - internet bağlantınızı kontrol edin',
  [AgentErrorType.UNKNOWN]: 'Bilinmeyen hata - lütfen tekrar deneyin'
};

// Turkish date patterns for parsing
export const TURKISH_DATE_PATTERNS = {
  months: {
    'ocak': 1, 'şubat': 2, 'mart': 3, 'nisan': 4, 'mayıs': 5, 'haziran': 6,
    'temmuz': 7, 'ağustos': 8, 'eylül': 9, 'ekim': 10, 'kasım': 11, 'aralık': 12,
    'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
    'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
  },
  relative: {
    'bugün': 0,
    'yarın': 1,
    'öbür gün': 2,
    'gelecek hafta': 7,
    'haftaya': 7,
    'gelecek ay': 30
  }
} as const;