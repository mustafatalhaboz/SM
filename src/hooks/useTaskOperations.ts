import { useCallback, useState } from 'react';
import { createTask, deleteTask } from '@/lib/firebase-operations';
import { TASK_DEFAULTS, TASK_MESSAGES, getDefaultDeadline } from '@/constants/taskConstants';
import { createTaskEditModal } from '@/components/tasks';
import { Task } from '@/lib/types';

interface UseTaskOperationsProps {
  projectId: string;
}

interface UseTaskOperationsReturn {
  isLoading: boolean;
  handleCreateTask: () => void;
  handleDeleteTask: (taskId: string, taskTitle: string) => void;
  handleTaskClick: (task: Task) => void;
}

export function useTaskOperations({ projectId }: UseTaskOperationsProps): UseTaskOperationsReturn {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateTask = useCallback(async () => {
    const taskTitle = prompt(TASK_MESSAGES.CREATION_PROMPT);
    
    if (!taskTitle?.trim()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await createTask({
        projectId,
        title: taskTitle.trim(),
        status: TASK_DEFAULTS.STATUS,
        type: TASK_DEFAULTS.TYPE,
        priority: TASK_DEFAULTS.PRIORITY,
        description: TASK_DEFAULTS.DESCRIPTION,
        assignedPerson: TASK_DEFAULTS.ASSIGNED_PERSON,
        deadline: getDefaultDeadline()
      });
      
      alert(TASK_MESSAGES.TASK_CREATED_SUCCESS(taskTitle));
    } catch (error) {
      console.error('Task creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      alert(TASK_MESSAGES.TASK_CREATION_ERROR(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const handleDeleteTask = useCallback(async (taskId: string, taskTitle: string) => {
    if (!confirm(TASK_MESSAGES.TASK_DELETE_CONFIRM(taskTitle))) {
      return;
    }

    setIsLoading(true);
    
    try {
      await deleteTask(taskId);
      alert(TASK_MESSAGES.TASK_DELETED_SUCCESS);
    } catch (error) {
      console.error('Task deletion error:', error);
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
        console.log('Task updated successfully');
      },
      onError: (error: string) => {
        console.error('Task update failed:', error);
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