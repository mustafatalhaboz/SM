import { useCallback, useState } from 'react';
import { createProject } from '@/lib/firebase-operations';
import { TASK_MESSAGES } from '@/constants/taskConstants';
import { logger } from '@/lib/logger';

interface UseProjectOperationsReturn {
  isLoading: boolean;
  handleCreateProject: () => void;
}

export function useProjectOperations(): UseProjectOperationsReturn {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateProject = useCallback(async () => {
    const projectName = prompt(TASK_MESSAGES.PROJECT_CREATION_PROMPT);
    
    if (!projectName?.trim()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await createProject({ name: projectName.trim() });
      alert(TASK_MESSAGES.PROJECT_CREATED_SUCCESS(projectName));
    } catch (error) {
      logger.error('Project creation failed in hook', { operation: 'useProjectOperations', error });
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      alert(TASK_MESSAGES.PROJECT_CREATION_ERROR(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    handleCreateProject
  };
}