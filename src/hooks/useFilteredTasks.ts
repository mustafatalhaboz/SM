import { useMemo, useState, useCallback } from 'react';
import { Task } from '@/lib/types';
import { useTasks } from './useFirestore';
import { logger } from '@/lib/logger';
import { Timestamp } from 'firebase/firestore';

// Filtered tasks return interface
export interface FilteredTasks {
  activeTasks: Task[];
  completedTasks: Task[];
  totalTasks: number;
  completedCount: number;
  completionRate: number;
}

// Hook return interface
interface UseFilteredTasksReturn extends FilteredTasks {
  loading: boolean;
  error: string | null;
  addOptimisticTask: (task: Partial<Task>) => void;
  removeOptimisticTask: (tempId: string) => void;
}

/**
 * Enhanced hook that provides filtered and categorized tasks for a project
 * Separates active and completed tasks with statistics
 * @param projectId - ID of the project to get tasks for
 */
export function useFilteredTasks(projectId: string): UseFilteredTasksReturn {
  const { tasks, loading, error } = useTasks(projectId);
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([]);
  
  // Optimistic task management
  const addOptimisticTask = useCallback((taskData: Partial<Task>) => {
    const optimisticTask: Task = {
      id: `temp-${Date.now()}`,
      projectId: taskData.projectId || projectId,
      title: taskData.title || 'Yeni Görev',
      description: taskData.description || '',
      assignedPerson: taskData.assignedPerson || '',
      status: taskData.status || 'Yapılacak',
      type: taskData.type || 'Operasyon',
      priority: taskData.priority || 'Orta',
      estimatedDuration: taskData.estimatedDuration || 'Orta',
      deadline: taskData.deadline || new Date(),
      createdAt: { toMillis: () => Date.now() } as unknown as Timestamp // Mock Timestamp
    };
    
    setOptimisticTasks(prev => [optimisticTask, ...prev]);
    logger.debug('Optimistic task added', { 
      taskId: optimisticTask.id, 
      projectId,
      title: optimisticTask.title 
    } as Record<string, unknown>);
  }, [projectId]);
  
  const removeOptimisticTask = useCallback((tempId: string) => {
    setOptimisticTasks(prev => prev.filter(task => task.id !== tempId));
    logger.debug('Optimistic task removed', { tempId, projectId } as Record<string, unknown>);
  }, [projectId]);
  
  // Combined tasks (real + optimistic) with duplicate cleanup
  const combinedTasks = useMemo(() => {
    // If we have real tasks, remove optimistic tasks that might be duplicates
    if (tasks.length > 0 && optimisticTasks.length > 0) {
      const recentTaskTitles = tasks
        .filter(task => Date.now() - task.createdAt.toMillis() < 5000) // Tasks created in last 5 seconds
        .map(task => task.title.trim().toLowerCase());
      
      const filteredOptimistic = optimisticTasks.filter(optTask => {
        const isDuplicate = recentTaskTitles.includes(optTask.title.trim().toLowerCase());
        if (isDuplicate) {
          logger.debug('Removing duplicate optimistic task', { 
            optimisticId: optTask.id, 
            title: optTask.title 
          } as Record<string, unknown>);
        }
        return !isDuplicate;
      });
      
      // Update state if we found duplicates
      if (filteredOptimistic.length !== optimisticTasks.length) {
        setOptimisticTasks(filteredOptimistic);
      }
      
      return [...filteredOptimistic, ...tasks];
    }
    
    return [...optimisticTasks, ...tasks];
  }, [optimisticTasks, tasks]);
  
  // Memoized task filtering and statistics
  const filteredData = useMemo((): FilteredTasks => {
    logger.debug('useFilteredTasks processing', {
      projectId,
      totalTasksReceived: tasks.length,
      optimisticTasksCount: optimisticTasks.length,
      combinedTasksCount: combinedTasks.length,
      taskIds: combinedTasks.map(t => t.id),
      taskStatuses: combinedTasks.map(t => ({ id: t.id, status: t.status })),
      timestamp: new Date().toISOString()
    } as Record<string, unknown>);

    // Filter active vs completed tasks (using combined tasks)
    const activeTasks = combinedTasks.filter(task => task.status !== 'Yapıldı');
    const completedTasks = combinedTasks.filter(task => task.status === 'Yapıldı');
    
    logger.debug('Tasks filtered', {
      projectId,
      activeTasks: activeTasks.length,
      activeTaskIds: activeTasks.map(t => t.id),
      completedTasks: completedTasks.length,
      completedTaskIds: completedTasks.map(t => t.id),
      timestamp: new Date().toISOString()
    } as Record<string, unknown>);
    
    // Sort active tasks by priority and deadline
    activeTasks.sort((a, b) => {
      const priorityOrder = { 'Yüksek': 3, 'Orta': 2, 'Düşük': 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.deadline.getTime() - b.deadline.getTime();
    });
    
    // Sort completed tasks by completion date (most recent first) 
    // Since we don't have completedAt field, sort by createdAt desc
    completedTasks.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    
    const totalTasks = combinedTasks.length;
    const completedCount = completedTasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
    
    const result = {
      activeTasks,
      completedTasks,
      totalTasks,
      completedCount,
      completionRate
    };

    logger.debug('useFilteredTasks result', {
      projectId,
      result,
      timestamp: new Date().toISOString()
    } as Record<string, unknown>);
    
    return result;
  }, [combinedTasks, projectId]);
  
  return {
    ...filteredData,
    loading,
    error,
    addOptimisticTask,
    removeOptimisticTask
  };
}

// Additional hook for project-level statistics
export function useProjectStats(projectId: string) {
  const { totalTasks, completedCount, completionRate, loading } = useFilteredTasks(projectId);
  
  return useMemo(() => ({
    totalTasks,
    completedCount,
    activeCount: totalTasks - completedCount,
    completionRate,
    loading,
    isCompleted: completionRate === 100 && totalTasks > 0,
    isEmpty: totalTasks === 0
  }), [totalTasks, completedCount, completionRate, loading]);
}