import { 
  AITaskResponse, 
  ProcessedTaskData, 
  TURKISH_DATE_PATTERNS,
  CommandType,
  TaskIdentification,
  UpdateFields
} from '@/types/agent';
import { 
  TaskStatus, 
  TaskType, 
  TaskPriority, 
  TaskDuration,
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
  TASK_DURATION_OPTIONS,
  DEFAULT_TASK_VALUES
} from '@/lib/types';
import { logger } from '@/lib/logger';

/**
 * Enhanced result type for different command types
 */
export interface ProcessedCommandResult {
  commandType: CommandType;
  // CREATE result
  createData?: ProcessedTaskData;
  // UPDATE result
  updateData?: {
    taskIdentification: TaskIdentification;
    updateFields: UpdateFields;
  };
  // COMPLETE result
  completeData?: {
    taskIdentification: TaskIdentification;
  };
}

/**
 * Processes AI response and converts it to validated command data
 */
export async function processTranscriptResponse(
  aiResponse: string,
  availableProjects: Array<{ id: string; name: string }>
): Promise<ProcessedCommandResult> {
  
  logger.debug('Transcript parser: Processing AI response', {
    responseLength: aiResponse.length,
    projectCount: availableProjects.length
  } as Record<string, unknown>);
  
  try {
    // Parse JSON response
    const parsedResponse: AITaskResponse = JSON.parse(aiResponse);
    
    logger.debug('Transcript parser: JSON parsed successfully', {
      title: parsedResponse.title,
      projectName: parsedResponse.projectName,
      confidence: parsedResponse.confidence
    } as Record<string, unknown>);
    
    // Validate command type
    if (!parsedResponse.commandType) {
      throw new Error('Komut tipi belirtilmemiş');
    }
    
    logger.debug('Transcript parser: Command type detected', {
      commandType: parsedResponse.commandType
    } as Record<string, unknown>);
    
    // Process based on command type
    switch (parsedResponse.commandType) {
      case 'CREATE':
        return await processCreateCommand(parsedResponse, availableProjects);
      
      case 'UPDATE':
        return processUpdateCommand(parsedResponse, availableProjects);
      
      case 'COMPLETE':
        return processCompleteCommand(parsedResponse, availableProjects);
      
      default:
        throw new Error(`Desteklenmeyen komut tipi: ${parsedResponse.commandType}`);
    }
    
  } catch (error) {
    logger.error('Transcript parser: Processing failed', { 
      error, 
      response: aiResponse 
    } as Record<string, unknown>);
    
    if (error instanceof SyntaxError) {
      throw new Error('AI yanıtı geçersiz JSON formatında');
    }
    
    throw new Error(error instanceof Error ? error.message : 'Metin işleme hatası');
  }
}

/**
 * Processes CREATE command from AI response
 */
async function processCreateCommand(
  parsedResponse: AITaskResponse,
  availableProjects: Array<{ id: string; name: string }>
): Promise<ProcessedCommandResult> {
  
  // Validate required fields for CREATE
  if (!parsedResponse.title || typeof parsedResponse.title !== 'string') {
    throw new Error('Görev başlığı bulunamadı veya geçersiz');
  }
  
  // Process project matching
  const projectMatch = findBestProjectMatch(parsedResponse.projectName, availableProjects);
  
  // Process date with Turkish support
  const processedDeadline = parseTurkishDate(parsedResponse.deadline);
  
  // Build processed task data with validation and defaults
  const createData: ProcessedTaskData = {
    projectId: projectMatch.id,
    projectName: projectMatch.name,
    title: parsedResponse.title.trim(),
    description: parsedResponse.description?.trim() || DEFAULT_TASK_VALUES.description || '',
    assignedPerson: parsedResponse.assignedPerson?.trim() || '',
    status: validateTaskStatus(parsedResponse.status) || DEFAULT_TASK_VALUES.status || 'Yapılacak',
    type: validateTaskType(parsedResponse.type) || 'Operasyon',
    priority: validateTaskPriority(parsedResponse.priority) || DEFAULT_TASK_VALUES.priority || 'Orta',
    estimatedDuration: validateTaskDuration(parsedResponse.estimatedDuration) || DEFAULT_TASK_VALUES.estimatedDuration || '30dk',
    deadline: processedDeadline,
    confidence: Math.max(0, Math.min(1, parsedResponse.confidence || 0.5))
  };
  
  logger.debug('Transcript parser: CREATE command processed', {
    taskTitle: createData.title,
    projectName: createData.projectName,
    confidence: createData.confidence
  } as Record<string, unknown>);
  
  return {
    commandType: 'CREATE',
    createData
  };
}

/**
 * Processes UPDATE command from AI response
 */
function processUpdateCommand(
  parsedResponse: AITaskResponse,
  _availableProjects: Array<{ id: string; name: string }>
): ProcessedCommandResult {
  
  // Validate required fields for UPDATE
  if (!parsedResponse.taskIdentification?.projectName || 
      !parsedResponse.taskIdentification?.taskName) {
    throw new Error('Görev tanımlama bilgileri eksik (proje ve görev ismi gerekli)');
  }
  
  if (!parsedResponse.updateFields || Object.keys(parsedResponse.updateFields).length === 0) {
    throw new Error('Güncellenecek alan bilgisi bulunamadı');
  }
  
  // Validate and process update fields
  const updateFields: UpdateFields = {};
  
  if (parsedResponse.updateFields.title) {
    updateFields.title = parsedResponse.updateFields.title.trim();
  }
  
  if (parsedResponse.updateFields.description) {
    updateFields.description = parsedResponse.updateFields.description.trim();
  }
  
  if (parsedResponse.updateFields.status) {
    const validStatus = validateTaskStatus(parsedResponse.updateFields.status);
    if (validStatus) {
      updateFields.status = validStatus;
    }
  }
  
  if (parsedResponse.updateFields.priority) {
    const validPriority = validateTaskPriority(parsedResponse.updateFields.priority);
    if (validPriority) {
      updateFields.priority = validPriority;
    }
  }
  
  if (parsedResponse.updateFields.estimatedDuration) {
    const validDuration = validateTaskDuration(parsedResponse.updateFields.estimatedDuration);
    if (validDuration) {
      updateFields.estimatedDuration = validDuration;
    }
  }
  
  if (parsedResponse.updateFields.deadline) {
    updateFields.deadline = parseTurkishDate(parsedResponse.updateFields.deadline).toISOString();
  }
  
  if (parsedResponse.updateFields.assignedPerson) {
    updateFields.assignedPerson = parsedResponse.updateFields.assignedPerson.trim();
  }
  
  logger.debug('Transcript parser: UPDATE command processed', {
    projectName: parsedResponse.taskIdentification.projectName,
    taskName: parsedResponse.taskIdentification.taskName,
    updateFields: Object.keys(updateFields)
  } as Record<string, unknown>);
  
  return {
    commandType: 'UPDATE',
    updateData: {
      taskIdentification: parsedResponse.taskIdentification,
      updateFields
    }
  };
}

/**
 * Processes COMPLETE command from AI response
 */
function processCompleteCommand(
  parsedResponse: AITaskResponse,
  _availableProjects: Array<{ id: string; name: string }>
): ProcessedCommandResult {
  
  // Validate required fields for COMPLETE
  if (!parsedResponse.taskIdentification?.projectName || 
      !parsedResponse.taskIdentification?.taskName) {
    throw new Error('Görev tanımlama bilgileri eksik (proje ve görev ismi gerekli)');
  }
  
  logger.debug('Transcript parser: COMPLETE command processed', {
    projectName: parsedResponse.taskIdentification.projectName,
    taskName: parsedResponse.taskIdentification.taskName
  } as Record<string, unknown>);
  
  return {
    commandType: 'COMPLETE',
    completeData: {
      taskIdentification: parsedResponse.taskIdentification
    }
  };
}

/**
 * Finds best matching project using fuzzy matching
 */
function findBestProjectMatch(
  projectName: string | undefined,
  availableProjects: Array<{ id: string; name: string }>
): { id: string; name: string } {
  
  // If no project mentioned or no projects available, use first available
  if (!projectName || availableProjects.length === 0) {
    logger.debug('Transcript parser: Using default project (first available)', {
      projectName,
      defaultProject: availableProjects[0]?.name
    } as Record<string, unknown>);
    return availableProjects[0] || { id: '', name: 'Genel' };
  }
  
  const normalizedSearch = projectName.toLowerCase().trim();
  
  // Exact match first
  const exactMatch = availableProjects.find(p => 
    p.name.toLowerCase() === normalizedSearch
  );
  if (exactMatch) {
    logger.debug('Transcript parser: Exact project match found', {
      searchTerm: projectName,
      matchedProject: exactMatch.name
    } as Record<string, unknown>);
    return exactMatch;
  }
  
  // Partial match (contains)
  const partialMatch = availableProjects.find(p => 
    p.name.toLowerCase().includes(normalizedSearch) ||
    normalizedSearch.includes(p.name.toLowerCase())
  );
  if (partialMatch) {
    logger.debug('Transcript parser: Partial project match found', {
      searchTerm: projectName,
      matchedProject: partialMatch.name
    } as Record<string, unknown>);
    return partialMatch;
  }
  
  // No match found, use first available
  logger.debug('Transcript parser: No project match found, using first available', {
    searchTerm: projectName,
    defaultProject: availableProjects[0]?.name
  } as Record<string, unknown>);
  return availableProjects[0] || { id: '', name: 'Genel' };
}

/**
 * Validates and corrects date to ensure it's not in the past or wrong year
 */
function validateParsedDate(date: Date): Date {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // If date is more than 1 year old, assume it should be current year
  if (date.getFullYear() < currentYear - 1) {
    logger.debug('Date validation: Correcting old year', {
      originalDate: date.toISOString(),
      originalYear: date.getFullYear(),
      correctedYear: currentYear
    } as Record<string, unknown>);
    
    date.setFullYear(currentYear);
  }
  
  // If date is in the past and within current year, it's probably a future date intended
  if (date < now && date.getFullYear() === currentYear) {
    // Only warn, don't auto-correct as user might explicitly want past date
    logger.debug('Date validation: Date is in the past', {
      parsedDate: date.toISOString(),
      currentDate: now.toISOString()
    } as Record<string, unknown>);
  }
  
  return date;
}

/**
 * Parses Turkish and English date expressions
 */
function parseTurkishDate(dateStr: string | undefined): Date {
  if (!dateStr) {
    // Default to 7 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    return defaultDate;
  }
  
  const normalized = dateStr.toLowerCase().trim();
  
  logger.debug('Transcript parser: Parsing date', {
    originalDate: dateStr,
    normalized
  } as Record<string, unknown>);
  
  // Try ISO date format first (YYYY-MM-DD)
  const isoMatch = normalized.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const date = new Date(isoMatch[0]);
    if (!isNaN(date.getTime())) {
      logger.debug('Transcript parser: ISO date parsed', {
        originalDate: dateStr,
        parsedDate: date.toISOString()
      } as Record<string, unknown>);
      return validateParsedDate(date);
    }
  }
  
  // Check relative dates
  for (const [turkishTerm, daysToAdd] of Object.entries(TURKISH_DATE_PATTERNS.relative)) {
    if (normalized.includes(turkishTerm)) {
      const date = new Date();
      date.setDate(date.getDate() + daysToAdd);
      logger.debug('Transcript parser: Relative date parsed', {
        originalDate: dateStr,
        turkishTerm,
        daysToAdd,
        parsedDate: date.toISOString()
      } as Record<string, unknown>);
      return date;
    }
  }
  
  // Parse Turkish date format (DD month YYYY or DD month)
  const turkishDateMatch = normalized.match(/(\d{1,2})\s+(\w+)(?:\s+(\d{4}))?/);
  if (turkishDateMatch && turkishDateMatch[1] && turkishDateMatch[2]) {
    const day = parseInt(turkishDateMatch[1]);
    const monthName = turkishDateMatch[2];
    const year = turkishDateMatch[3] ? parseInt(turkishDateMatch[3]) : new Date().getFullYear();
    
    const monthNum = TURKISH_DATE_PATTERNS.months[monthName as keyof typeof TURKISH_DATE_PATTERNS.months];
    
    if (monthNum && day >= 1 && day <= 31) {
      const date = new Date(year, monthNum - 1, day);
      if (!isNaN(date.getTime())) {
        logger.debug('Transcript parser: Turkish date format parsed', {
          originalDate: dateStr,
          day,
          monthName,
          year,
          parsedDate: date.toISOString()
        } as Record<string, unknown>);
        return validateParsedDate(date);
      }
    }
  }
  
  // Try standard Date parsing as fallback
  const parsedDate = new Date(dateStr);
  if (!isNaN(parsedDate.getTime())) {
    logger.debug('Transcript parser: Standard date parsing succeeded', {
      originalDate: dateStr,
      parsedDate: parsedDate.toISOString()
    } as Record<string, unknown>);
    return validateParsedDate(parsedDate);
  }
  
  // Fallback to 7 days from now
  const fallbackDate = new Date();
  fallbackDate.setDate(fallbackDate.getDate() + 7);
  
  logger.debug('Transcript parser: Date parsing failed, using fallback', {
    originalDate: dateStr,
    fallbackDate: fallbackDate.toISOString()
  } as Record<string, unknown>);
  
  return fallbackDate;
}

/**
 * Validates task status
 */
function validateTaskStatus(status: string | undefined): TaskStatus | null {
  if (!status) return null;
  const normalized = status as TaskStatus;
  return TASK_STATUS_OPTIONS.includes(normalized) ? normalized : null;
}

/**
 * Validates task type
 */
function validateTaskType(type: string | undefined): TaskType | null {
  if (!type) return null;
  const validTypes: TaskType[] = ['Operasyon', 'Yönlendirme', 'Takip'];
  const normalized = type as TaskType;
  return validTypes.includes(normalized) ? normalized : null;
}

/**
 * Validates task priority
 */
function validateTaskPriority(priority: string | undefined): TaskPriority | null {
  if (!priority) return null;
  const normalized = priority as TaskPriority;
  return TASK_PRIORITY_OPTIONS.includes(normalized) ? normalized : null;
}

/**
 * Validates task duration
 */
function validateTaskDuration(duration: string | undefined): TaskDuration | null {
  if (!duration) return null;
  const normalized = duration as TaskDuration;
  return TASK_DURATION_OPTIONS.includes(normalized) ? normalized : null;
}