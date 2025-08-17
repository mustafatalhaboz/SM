import { useMemo } from 'react';
import { Task } from '@/lib/types';
import { useTasks } from './useFirestore';

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
}

/**
 * Enhanced hook that provides filtered and categorized tasks for a project
 * Separates active and completed tasks with statistics
 * @param projectId - ID of the project to get tasks for
 */
export function useFilteredTasks(projectId: string): UseFilteredTasksReturn {
  const { tasks, loading, error } = useTasks(projectId);
  
  // Memoized task filtering and statistics
  const filteredData = useMemo((): FilteredTasks => {
    // Filter active vs completed tasks
    const activeTasks = tasks.filter(task => task.status !== 'Yapıldı');
    const completedTasks = tasks.filter(task => task.status === 'Yapıldı');
    
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
    
    const totalTasks = tasks.length;
    const completedCount = completedTasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
    
    return {
      activeTasks,
      completedTasks,
      totalTasks,
      completedCount,
      completionRate
    };
  }, [tasks]);
  
  return {
    ...filteredData,
    loading,
    error
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