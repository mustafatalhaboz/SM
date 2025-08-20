import { useState, useCallback, useRef } from 'react';
import { createTask, updateTask } from '@/lib/firebase-operations';
import { 
  searchTasksByName, 
  getBestTaskMatch, 
  needsUserConfirmation,
  CONFIDENCE_THRESHOLDS
} from '@/lib/task-search';
import { TaskWithProject } from '@/lib/types';
import { logger } from '@/lib/logger';
import {
  TaskAgentState,
  AgentStatus,
  AgentError,
  AgentErrorType,
  AgentResult,
  UseTaskAgentOptions,
  UseTaskAgentReturn,
  AnalyzeTranscriptRequest,
  AnalyzeTranscriptResponse,
  ProcessedTaskData,
  TaskMatchConfirmation,
  TaskSearchResult,
  ProcessedCommandResult,
  AGENT_ERROR_MESSAGES
} from '@/types/agent';

/**
 * Hook for managing AI task agent state and operations
 */
export function useTaskAgent(options?: UseTaskAgentOptions): UseTaskAgentReturn {
  const { onSuccess, onError } = options || {};
  
  // State
  const [state, setState] = useState<TaskAgentState>({
    status: 'idle',
    currentTranscript: '',
    result: null,
    error: null
  });
  
  // Store last request for retry functionality
  const lastRequestRef = useRef<{
    transcript: string;
    projects: Array<{ id: string; name: string }>;
    tasks?: TaskWithProject[];
  } | null>(null);
  
  // Store confirmation data for user decisions
  const confirmationRef = useRef<TaskMatchConfirmation | null>(null);
  
  /**
   * Updates agent status
   */
  const updateStatus = useCallback((status: AgentStatus) => {
    setState(prev => ({ ...prev, status }));
  }, []);
  
  /**
   * Sets error state
   */
  const setError = useCallback((error: AgentError) => {
    setState(prev => ({ 
      ...prev, 
      status: 'error', 
      error,
      result: null 
    }));
    onError?.(error);
    logger.error('Task agent error', { error } as Record<string, unknown>);
  }, [onError]);
  
  /**
   * Sets success result
   */
  const setResult = useCallback((result: AgentResult) => {
    setState(prev => ({ 
      ...prev, 
      status: 'completed', 
      result,
      error: null 
    }));
    if (result.success) {
      onSuccess?.(result);
    }
    logger.debug('Task agent result set', { result } as Record<string, unknown>);
  }, [onSuccess]);
  
  /**
   * Executes command based on parsed result
   */
  const executeCommand = useCallback(async (commandResult: ProcessedCommandResult, availableTasks: TaskWithProject[]) => {
    updateStatus('creating');
    
    switch (commandResult.commandType) {
      case 'CREATE': {
        if (!commandResult.createData) {
          throw new Error('CREATE komut verisi bulunamadı');
        }
        
        const taskId = await createTask({
          projectId: commandResult.createData.projectId,
          title: commandResult.createData.title,
          description: commandResult.createData.description,
          assignedPerson: commandResult.createData.assignedPerson,
          status: commandResult.createData.status,
          type: commandResult.createData.type,
          priority: commandResult.createData.priority,
          estimatedDuration: commandResult.createData.estimatedDuration,
          deadline: new Date(commandResult.createData.deadline)
        });
        
        const successResult: AgentResult = {
          success: true,
          commandType: 'CREATE',
          taskData: commandResult.createData,
          taskId
        };
        
        setResult(successResult);
        break;
      }
      
      case 'UPDATE': {
        if (!commandResult.updateData?.taskIdentification) {
          throw new Error('UPDATE komut verisi bulunamadı');
        }
        
        // Search for the task with enhanced matching
        const searchResults = searchTasksByName(availableTasks, commandResult.updateData.taskIdentification);
        const bestMatch = getBestTaskMatch(searchResults);
        
        // Check if we need user confirmation
        if (!bestMatch || bestMatch.confidence < CONFIDENCE_THRESHOLDS.AUTO_ACCEPT) {
          // Handle different confirmation scenarios
          if (needsUserConfirmation(searchResults) && bestMatch) {
            // Single uncertain match - ask for confirmation
            const confirmationData: TaskMatchConfirmation = {
              searchTerm: commandResult.updateData.taskIdentification.taskName,
              commandType: 'UPDATE',
              commandData: commandResult,
              possibleMatches: searchResults.matches,
              topMatch: bestMatch,
              needsDisambiguation: false,
              needsConfirmation: true
            };
            
            confirmationRef.current = confirmationData;
            updateStatus('awaiting-confirmation');
            
            const result: AgentResult = {
              success: false,
              commandType: 'UPDATE',
              needsUserConfirmation: true,
              confirmationData
            };
            
            setResult(result);
            return;
          } else if (searchResults.needsDisambiguation) {
            // Multiple matches - show disambiguation
            const confirmationData: TaskMatchConfirmation = {
              searchTerm: commandResult.updateData.taskIdentification.taskName,
              commandType: 'UPDATE',
              commandData: commandResult,
              possibleMatches: searchResults.matches,
              needsDisambiguation: true,
              needsConfirmation: false
            };
            
            confirmationRef.current = confirmationData;
            updateStatus('awaiting-confirmation');
            
            const result: AgentResult = {
              success: false,
              commandType: 'UPDATE',
              needsUserConfirmation: true,
              confirmationData
            };
            
            setResult(result);
            return;
          } else {
            // No matches found
            throw new Error(`Görev bulunamadı: "${commandResult.updateData.taskIdentification.taskName}" (${commandResult.updateData.taskIdentification.projectName})`);
          }
        }
        
        // Convert update fields to proper format
        const updateData: Record<string, unknown> = {};
        const updateFields = commandResult.updateData.updateFields;
        
        if (updateFields.title) updateData.title = updateFields.title;
        if (updateFields.description) updateData.description = updateFields.description;
        if (updateFields.status) updateData.status = updateFields.status;
        if (updateFields.priority) updateData.priority = updateFields.priority;
        if (updateFields.estimatedDuration) updateData.estimatedDuration = updateFields.estimatedDuration;
        if (updateFields.deadline) updateData.deadline = new Date(updateFields.deadline);
        if (updateFields.assignedPerson) updateData.assignedPerson = updateFields.assignedPerson;
        
        await updateTask(bestMatch.task.id, updateData);
        
        const successResult: AgentResult = {
          success: true,
          commandType: 'UPDATE',
          updatedTask: {
            taskId: bestMatch.task.id,
            taskTitle: bestMatch.task.title,
            projectName: bestMatch.projectName,
            updatedFields: updateFields
          }
        };
        
        setResult(successResult);
        break;
      }
      
      case 'COMPLETE': {
        if (!commandResult.completeData?.taskIdentification) {
          throw new Error('COMPLETE komut verisi bulunamadı');
        }
        
        // Search for the task with enhanced matching
        const searchResults = searchTasksByName(availableTasks, commandResult.completeData.taskIdentification);
        const bestMatch = getBestTaskMatch(searchResults);
        
        // Check if we need user confirmation
        if (!bestMatch || bestMatch.confidence < CONFIDENCE_THRESHOLDS.AUTO_ACCEPT) {
          // Handle different confirmation scenarios
          if (needsUserConfirmation(searchResults) && bestMatch) {
            // Single uncertain match - ask for confirmation
            const confirmationData: TaskMatchConfirmation = {
              searchTerm: commandResult.completeData.taskIdentification.taskName,
              commandType: 'COMPLETE',
              commandData: commandResult,
              possibleMatches: searchResults.matches,
              topMatch: bestMatch,
              needsDisambiguation: false,
              needsConfirmation: true
            };
            
            confirmationRef.current = confirmationData;
            updateStatus('awaiting-confirmation');
            
            const result: AgentResult = {
              success: false,
              commandType: 'COMPLETE',
              needsUserConfirmation: true,
              confirmationData
            };
            
            setResult(result);
            return;
          } else if (searchResults.needsDisambiguation) {
            // Multiple matches - show disambiguation
            const confirmationData: TaskMatchConfirmation = {
              searchTerm: commandResult.completeData.taskIdentification.taskName,
              commandType: 'COMPLETE',
              commandData: commandResult,
              possibleMatches: searchResults.matches,
              needsDisambiguation: true,
              needsConfirmation: false
            };
            
            confirmationRef.current = confirmationData;
            updateStatus('awaiting-confirmation');
            
            const result: AgentResult = {
              success: false,
              commandType: 'COMPLETE',
              needsUserConfirmation: true,
              confirmationData
            };
            
            setResult(result);
            return;
          } else {
            // No matches found
            throw new Error(`Görev bulunamadı: "${commandResult.completeData.taskIdentification.taskName}" (${commandResult.completeData.taskIdentification.projectName})`);
          }
        }
        
        await updateTask(bestMatch.task.id, { status: 'Yapıldı' });
        
        const successResult: AgentResult = {
          success: true,
          commandType: 'COMPLETE',
          completedTask: {
            taskId: bestMatch.task.id,
            taskTitle: bestMatch.task.title,
            projectName: bestMatch.projectName
          }
        };
        
        setResult(successResult);
        break;
      }
      
      default:
        throw new Error(`Desteklenmeyen komut tipi: ${commandResult.commandType}`);
    }
  }, [setResult, updateStatus]);
  
  /**
   * Enhanced function to analyze transcript and execute commands (CREATE/UPDATE/COMPLETE)
   */
  const analyzeAndExecuteCommand = useCallback(async (
    transcript: string,
    availableProjects: Array<{ id: string; name: string }>,
    availableTasks: TaskWithProject[] = [] // For UPDATE and COMPLETE operations
  ) => {
    try {
      logger.debug('Task agent: Starting analysis', {
        transcriptLength: transcript.length,
        projectCount: availableProjects.length
      } as Record<string, unknown>);
      
      // Store for retry functionality
      lastRequestRef.current = { 
        transcript, 
        projects: availableProjects,
        tasks: availableTasks 
      };
      
      // Reset state and set analyzing
      setState(prev => ({
        ...prev,
        status: 'analyzing',
        currentTranscript: transcript,
        error: null,
        result: null
      }));
      
      // Validate inputs
      if (!transcript.trim()) {
        throw new Error('Metin boş');
      }
      
      if (!availableProjects.length) {
        throw new Error('Proje listesi boş');
      }
      
      // Call API endpoint
      const apiRequest: AnalyzeTranscriptRequest = {
        transcript: transcript.trim(),
        projects: availableProjects
      };
      
      logger.debug('Task agent: Calling API endpoint', {
        apiUrl: '/api/agent/analyze-transcript'
      } as Record<string, unknown>);
      
      const response = await fetch('/api/agent/analyze-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequest),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Task agent: API request failed', {
          status: response.status,
          statusText: response.statusText,
          errorText
        } as Record<string, unknown>);
        
        throw new Error(`API hatası: ${response.status} ${response.statusText}`);
      }
      
      const apiResponseData = await response.json();
      
      if (!apiResponseData.success) {
        const apiError = apiResponseData.error;
        logger.error('Task agent: API returned error', { apiError } as Record<string, unknown>);
        
        setError({
          type: apiError?.type || AgentErrorType.UNKNOWN,
          message: apiError?.message || 'Bilinmeyen API hatası',
          ...(apiError?.details && { details: apiError.details }),
          recoverable: true
        });
        return;
      }
      
      // Check if this is a legacy CREATE response or new command response
      if (apiResponseData.data && !apiResponseData.commandResult) {
        // Legacy CREATE response - maintain backward compatibility
        const apiResponse: AnalyzeTranscriptResponse = apiResponseData;
        
        updateStatus('creating');
        
        const taskId = await createTask({
          projectId: apiResponse.data!.projectId,
          title: apiResponse.data!.title,
          description: apiResponse.data!.description,
          assignedPerson: apiResponse.data!.assignedPerson,
          status: apiResponse.data!.status,
          type: apiResponse.data!.type,
          priority: apiResponse.data!.priority,
          estimatedDuration: apiResponse.data!.estimatedDuration,
          deadline: new Date(apiResponse.data!.deadline)
        });
        
        const taskData: ProcessedTaskData = {
          ...apiResponse.data!,
          deadline: new Date(apiResponse.data!.deadline)
        };
        
        const successResult: AgentResult = {
          success: true,
          commandType: 'CREATE',
          taskData,
          taskId
        };
        
        setResult(successResult);
        return;
      }
      
      // New command-based response
      const commandResult = apiResponseData.commandResult;
      if (!commandResult) {
        setError({
          type: AgentErrorType.PARSING_ERROR,
          message: 'Komut sonucu bulunamadı',
          recoverable: true
        });
        return;
      }
      
      // Execute command based on type
      await executeCommand(commandResult, availableTasks);
      
      logger.debug('Task agent: Command executed successfully', {
        commandType: commandResult.commandType
      } as Record<string, unknown>);
      
    } catch (error) {
      logger.error('Task agent: Unexpected error', { error } as Record<string, unknown>);
      
      let agentError: AgentError;
      
      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes('Firebase') || error.message.includes('Firestore')) {
          agentError = {
            type: AgentErrorType.FIREBASE_ERROR,
            message: AGENT_ERROR_MESSAGES[AgentErrorType.FIREBASE_ERROR],
            details: error.message,
            recoverable: true
          };
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          agentError = {
            type: AgentErrorType.NETWORK_ERROR,
            message: AGENT_ERROR_MESSAGES[AgentErrorType.NETWORK_ERROR],
            details: error.message,
            recoverable: true
          };
        } else {
          agentError = {
            type: AgentErrorType.UNKNOWN,
            message: error.message || AGENT_ERROR_MESSAGES[AgentErrorType.UNKNOWN],
            recoverable: true
          };
        }
      } else {
        agentError = {
          type: AgentErrorType.UNKNOWN,
          message: AGENT_ERROR_MESSAGES[AgentErrorType.UNKNOWN],
          recoverable: true
        };
      }
      
      setError(agentError);
    }
  }, [setError, setResult, updateStatus, executeCommand]);
  
  /**
   * Retries the last analysis
   */
  const retryLastAnalysis = useCallback(async () => {
    const lastRequest = lastRequestRef.current;
    if (!lastRequest) {
      logger.error('Task agent: No last request to retry', {} as Record<string, unknown>);
      return;
    }
    
    logger.debug('Task agent: Retrying last analysis', {
      transcript: lastRequest.transcript.substring(0, 50) + '...'
    } as Record<string, unknown>);
    
    await analyzeAndExecuteCommand(lastRequest.transcript, lastRequest.projects, lastRequest.tasks);
  }, [analyzeAndExecuteCommand]);
  
  /**
   * Confirms the user's choice of task match and proceeds with the operation
   */
  const confirmTaskMatch = useCallback(async (selectedMatch: TaskSearchResult) => {
    const confirmationData = confirmationRef.current;
    if (!confirmationData) {
      setError({
        type: AgentErrorType.VALIDATION_ERROR,
        message: 'Onaylanacak görev verisi bulunamadı',
        recoverable: false
      });
      return;
    }
    
    try {
      logger.debug('Task agent: User confirmed task match', {
        selectedTask: selectedMatch.task.title,
        confidence: selectedMatch.confidence,
        commandType: confirmationData.commandType
      } as Record<string, unknown>);
      
      // Execute the original command with the confirmed task
      updateStatus('creating');
      
      switch (confirmationData.commandType) {
        case 'UPDATE': {
          const updateData = confirmationData.commandData.updateData;
          if (!updateData) {
            throw new Error('UPDATE komut verisi bulunamadı');
          }
          
          // Convert update fields to proper format
          const updateFields: Record<string, unknown> = {};
          if (updateData.updateFields.title) updateFields.title = updateData.updateFields.title;
          if (updateData.updateFields.description) updateFields.description = updateData.updateFields.description;
          if (updateData.updateFields.status) updateFields.status = updateData.updateFields.status;
          if (updateData.updateFields.priority) updateFields.priority = updateData.updateFields.priority;
          if (updateData.updateFields.estimatedDuration) updateFields.estimatedDuration = updateData.updateFields.estimatedDuration;
          if (updateData.updateFields.deadline) updateFields.deadline = new Date(updateData.updateFields.deadline);
          if (updateData.updateFields.assignedPerson) updateFields.assignedPerson = updateData.updateFields.assignedPerson;
          
          await updateTask(selectedMatch.task.id, updateFields);
          
          const successResult: AgentResult = {
            success: true,
            commandType: 'UPDATE',
            updatedTask: {
              taskId: selectedMatch.task.id,
              taskTitle: selectedMatch.task.title,
              projectName: selectedMatch.projectName,
              updatedFields: updateData.updateFields
            }
          };
          
          setResult(successResult);
          break;
        }
        
        case 'COMPLETE': {
          await updateTask(selectedMatch.task.id, { status: 'Yapıldı' });
          
          const successResult: AgentResult = {
            success: true,
            commandType: 'COMPLETE',
            completedTask: {
              taskId: selectedMatch.task.id,
              taskTitle: selectedMatch.task.title,
              projectName: selectedMatch.projectName
            }
          };
          
          setResult(successResult);
          break;
        }
        
        default:
          throw new Error(`Desteklenmeyen komut tipi: ${confirmationData.commandType}`);
      }
      
      // Clear confirmation data
      confirmationRef.current = null;
      
    } catch (error) {
      logger.error('Task agent: Confirmed task operation failed', { error } as Record<string, unknown>);
      
      const agentError: AgentError = {
        type: AgentErrorType.FIREBASE_ERROR,
        message: error instanceof Error ? error.message : 'Görev işlemi başarısız',
        recoverable: true
      };
      
      setError(agentError);
    }
  }, [setResult, setError, updateStatus]);
  
  /**
   * Rejects current suggestion and shows disambiguation options
   */
  const rejectAndDisambiguate = useCallback(() => {
    const confirmationData = confirmationRef.current;
    if (!confirmationData) return;
    
    // Update confirmation data to show disambiguation instead
    const updatedConfirmation: TaskMatchConfirmation = {
      ...confirmationData,
      needsDisambiguation: true,
      needsConfirmation: false
    };
    
    confirmationRef.current = updatedConfirmation;
    
    const result: AgentResult = {
      success: false,
      commandType: confirmationData.commandType,
      needsUserConfirmation: true,
      confirmationData: updatedConfirmation
    };
    
    setResult(result);
    logger.debug('Task agent: User rejected suggestion, showing disambiguation', {} as Record<string, unknown>);
  }, [setResult]);
  
  /**
   * Creates a new task instead of using existing matches
   */
  const createNewTask = useCallback(async () => {
    const confirmationData = confirmationRef.current;
    if (!confirmationData) return;
    
    // For UPDATE/COMPLETE operations, we can't create a new task
    // Instead, we'll show an error or ask user to use CREATE command
    if (confirmationData.commandType !== 'CREATE') {
      setError({
        type: AgentErrorType.VALIDATION_ERROR,
        message: 'Yeni görev oluşturmak için CREATE komutunu kullanın. Örnek: "Yeni görev oluştur: [görev adı]"',
        recoverable: true
      });
      return;
    }
    
    // For CREATE operations, proceed with the original data
    // This functionality would be implemented when we extend CREATE operations
    // For now, just show a message
    setError({
      type: AgentErrorType.VALIDATION_ERROR,
      message: 'Yeni görev oluşturma işlemi henüz bu modda desteklenmiyor',
      recoverable: true
    });
  }, [setError]);
  
  /**
   * Resets agent state
   */
  const reset = useCallback(() => {
    setState({
      status: 'idle',
      currentTranscript: '',
      result: null,
      error: null
    });
    lastRequestRef.current = null;
    confirmationRef.current = null;
    logger.debug('Task agent: State reset', {} as Record<string, unknown>);
  }, []);
  
  return {
    state,
    actions: {
      analyzeAndCreateTask: analyzeAndExecuteCommand, // Maintain backward compatibility
      analyzeAndExecuteCommand,
      confirmTaskMatch,
      rejectAndDisambiguate,
      createNewTask,
      reset,
      retryLastAnalysis
    }
  };
}