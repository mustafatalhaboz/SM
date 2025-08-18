import { useCallback, useState } from 'react';
import { createTask, deleteTask } from '@/lib/firebase-operations';
import { TASK_DEFAULTS, TASK_MESSAGES, getDefaultDeadline } from '@/constants/taskConstants';
import { createTaskEditModal } from '@/components/tasks';
import { Task } from '@/lib/types';
import { logger } from '@/lib/logger';

interface UseTaskOperationsProps {
  projectId: string;
  addOptimisticTask?: (task: Partial<Task>) => void;
  removeOptimisticTask?: (tempId: string) => void;
}

interface UseTaskOperationsReturn {
  isLoading: boolean;
  handleCreateTask: () => void;
  handleDeleteTask: (taskId: string, taskTitle: string) => void;
  handleTaskClick: (task: Task) => void;
}

export function useTaskOperations({ projectId, addOptimisticTask, removeOptimisticTask }: UseTaskOperationsProps): UseTaskOperationsReturn {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateTask = useCallback(async () => {
    const taskTitle = prompt(TASK_MESSAGES.CREATION_PROMPT);
    
    if (!taskTitle?.trim()) {
      logger.debug('Task creation cancelled - empty title', { projectId });
      return;
    }

    logger.debug('Task creation started', { 
      projectId, 
      taskTitle: taskTitle.trim(),
      timestamp: new Date().toISOString()
    });

    setIsLoading(true);
    
    const taskData = {
      projectId,
      title: taskTitle.trim(),
      status: TASK_DEFAULTS.STATUS,
      priority: TASK_DEFAULTS.PRIORITY,
      description: TASK_DEFAULTS.DESCRIPTION,
      deadline: getDefaultDeadline()
    };

    // Optimistic update - immediately show task in UI
    let tempTaskId: string | null = null;
    if (addOptimisticTask) {
      tempTaskId = `temp-${Date.now()}`;
      addOptimisticTask({
        ...taskData,
        id: tempTaskId
      });
      logger.debug('Optimistic task added to UI', { tempTaskId, title: taskData.title });
    }
    
    try {
      logger.debug('Creating task with data', taskData);
      
      const createdTaskId = await createTask(taskData);
      
      logger.debug('Task created successfully', { 
        taskId: createdTaskId,
        projectId,
        taskTitle: taskTitle.trim(),
        timestamp: new Date().toISOString()
      });
      
      // Optimistic task cleanup is now handled automatically by useFilteredTasks
      logger.debug('Real task created - optimistic cleanup will happen automatically', { 
        tempTaskId, 
        realTaskId: createdTaskId 
      });
      
      alert(TASK_MESSAGES.TASK_CREATED_SUCCESS(taskTitle));
    } catch (error) {
      // Remove optimistic task on error
      if (tempTaskId && removeOptimisticTask) {
        removeOptimisticTask(tempTaskId);
        logger.debug('Optimistic task removed due to error', { tempTaskId });
      }
      
      logger.error('Task creation failed in hook', { projectId, taskTitle, error });
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      alert(TASK_MESSAGES.TASK_CREATION_ERROR(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [projectId, addOptimisticTask, removeOptimisticTask]);

  const handleDeleteTask = useCallback(async (taskId: string, taskTitle: string) => {
    if (!confirm(TASK_MESSAGES.TASK_DELETE_CONFIRM(taskTitle))) {
      return;
    }

    setIsLoading(true);
    
    try {
      await deleteTask(taskId);
      alert(TASK_MESSAGES.TASK_DELETED_SUCCESS);
    } catch (error) {
      logger.error('Task deletion failed in hook', { taskId, taskTitle, error });
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      alert(TASK_MESSAGES.TASK_DELETION_ERROR(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTaskClick = useCallback((task: Task) => {
    // Open task edit modal
    createTaskEditModal({
      task,
      onSuccess: () => {
        // Success callback - modal already closed and success alert shown
        logger.debug('Task updated successfully via modal', { taskId: task.id });
      },
      onError: (error: string) => {
        logger.error('Task update failed via modal', { taskId: task.id, error });
      }
    });
  }, []);

  return {
    isLoading,
    handleCreateTask,
    handleDeleteTask,
    handleTaskClick
  };
}