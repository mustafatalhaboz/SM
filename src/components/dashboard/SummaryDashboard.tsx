'use client';

import { useHighPriorityTasksWithProjects, useDateGroupedTasks } from '@/hooks';
import { updateTask } from '@/lib/firebase-operations';
import { logger } from '@/lib/logger';
import { createTaskEditModal } from '@/components/tasks/TaskEditModal';
import { TaskWithProject } from '@/lib/types';
import DateGroupAccordion from './DateGroupAccordion';

// Note: TaskRow and badge components moved to DateGroupAccordion for reuse

// Loading component
function LoadingState() {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Yüksek öncelikli görevler yükleniyor...</span>
      </div>
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="bg-white rounded-lg border p-6 text-center">
      <div className="text-gray-400 mb-2">📋</div>
      <h3 className="font-medium text-gray-900 mb-1">Yüksek öncelikli görev yok</h3>
      <p className="text-sm text-gray-500">
        Henüz yüksek veya orta öncelikli görev bulunmuyor.
      </p>
    </div>
  );
}

// Main SummaryDashboard component  
export default function SummaryDashboard() {
  const { tasks, loading, error } = useHighPriorityTasksWithProjects();
  
  // Group tasks by date categories
  const { groups, totalTasks } = useDateGroupedTasks(tasks);

  // Handle task completion
  const handleCompleteTask = async (taskId: string) => {
    try {
      // Find the task from our current tasks to get all data
      const taskToComplete = tasks.find(task => task.id === taskId);
      if (!taskToComplete) {
        throw new Error('Task not found in current data');
      }
      
      // Update with full task data (Firebase rules requirement)
      await updateTask(taskId, {
        title: taskToComplete.title,
        description: taskToComplete.description,
        status: 'Yapıldı',
        priority: taskToComplete.priority,
        estimatedDuration: taskToComplete.estimatedDuration,
        deadline: taskToComplete.deadline
      });
      
      logger.debug('Task marked as completed from dashboard', { taskId });
    } catch (error) {
      logger.error('Failed to complete task from dashboard', { taskId, error });
    }
  };

  // Handle task editing
  const handleTaskEdit = (task: TaskWithProject) => {
    createTaskEditModal({
      task,
      onSuccess: () => {
        logger.debug('Task updated from dashboard', { taskId: task.id });
      },
      onError: (error) => {
        logger.error('Failed to update task from dashboard', { taskId: task.id, error });
      }
    });
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-400">⚠️</div>
          <div className="ml-2">
            <h3 className="font-medium text-red-800">Hata</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (totalTasks === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Yüksek Öncelikli Görevler
        </h2>
        <span className="text-sm text-gray-500">
          {totalTasks} görev
        </span>
      </div>

      {/* Date-based Accordion Groups */}
      <div className="space-y-3">
        {groups.map((group) => (
          <DateGroupAccordion
            key={group.key}
            group={group}
            onCompleteTask={handleCompleteTask}
            onTaskEdit={handleTaskEdit}
          />
        ))}
      </div>
    </div>
  );
}