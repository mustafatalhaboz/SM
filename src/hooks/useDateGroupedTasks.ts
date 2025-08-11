import { useMemo } from 'react';
import { TaskWithProject } from '@/lib/types';
import { isToday, isTomorrow, isDayAfter, isLater } from '@/lib/dateUtils';

export interface DateGroup {
  key: 'today' | 'tomorrow' | 'dayAfter' | 'later';
  title: string;
  emoji: string;
  tasks: TaskWithProject[];
  count: number;
  isDefaultExpanded: boolean;
  color: string; // For styling
}

interface UseDateGroupedTasksReturn {
  groups: DateGroup[];
  totalTasks: number;
}

/**
 * Groups tasks by date categories with proper sorting
 * @param tasks Array of tasks with project information
 * @returns Grouped tasks organized by date proximity
 */
export function useDateGroupedTasks(tasks: TaskWithProject[]): UseDateGroupedTasksReturn {
  const groups = useMemo(() => {
    // Filter out completed tasks first
    const incompleteTasks = tasks.filter(task => task.status !== 'Yapıldı');
    
    // Group tasks by date categories
    const todayTasks = incompleteTasks.filter(task => isToday(task.deadline));
    const tomorrowTasks = incompleteTasks.filter(task => isTomorrow(task.deadline));
    const dayAfterTasks = incompleteTasks.filter(task => isDayAfter(task.deadline));
    const laterTasks = incompleteTasks.filter(task => isLater(task.deadline));
    
    // Sort each group by priority (high to low) then by deadline
    const sortTasks = (taskList: TaskWithProject[]): TaskWithProject[] => {
      return taskList.sort((a, b) => {
        // Priority order
        const priorityOrder = { 'Yüksek': 3, 'Orta': 2, 'Düşük': 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        
        if (priorityDiff !== 0) return priorityDiff;
        
        // If same priority, sort by deadline (earliest first)
        return a.deadline.getTime() - b.deadline.getTime();
      });
    };
    
    const dateGroups: DateGroup[] = [
      {
        key: 'today',
        title: 'Bugünün Görevleri',
        emoji: '📅',
        tasks: sortTasks(todayTasks),
        count: todayTasks.length,
        isDefaultExpanded: true,
        color: 'red' // Urgent
      },
      {
        key: 'tomorrow',
        title: 'Yarının Görevleri',
        emoji: '📋',
        tasks: sortTasks(tomorrowTasks),
        count: tomorrowTasks.length,
        isDefaultExpanded: false,
        color: 'orange' // Soon
      },
      {
        key: 'dayAfter',
        title: 'Ertesi Günün Görevleri',
        emoji: '📝',
        tasks: sortTasks(dayAfterTasks),
        count: dayAfterTasks.length,
        isDefaultExpanded: false,
        color: 'yellow' // Upcoming
      },
      {
        key: 'later',
        title: 'Sonraki Görevler',
        emoji: '📊',
        tasks: sortTasks(laterTasks),
        count: laterTasks.length,
        isDefaultExpanded: false,
        color: 'blue' // Future
      }
    ];
    
    // Only return groups that have tasks
    return dateGroups.filter(group => group.count > 0);
  }, [tasks]);
  
  const totalTasks = useMemo(() => {
    return groups.reduce((sum, group) => sum + group.count, 0);
  }, [groups]);
  
  return {
    groups,
    totalTasks
  };
}