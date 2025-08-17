'use client';

import { Task } from '@/lib/types';
import { TaskRow } from '@/components/tasks';

interface ActiveTasksSectionProps {
  tasks: Task[];
  loading?: boolean;
  onTaskClick: (task: Task) => void;
  onDeleteTask: (taskId: string, taskTitle: string) => void;
}

// Table header component for active tasks
function ActiveTasksTableHeader() {
  return (
    <div className="grid grid-cols-12 gap-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 px-3 py-2 rounded-t-lg">
      <div className="col-span-6">Görev</div>
      <div className="col-span-2 text-center">Öncelik</div>
      <div className="col-span-2 text-center">Durum</div>
      <div className="col-span-2 text-center">Tarih</div>
    </div>
  );
}

// Empty state component for no active tasks
function NoActiveTasksState() {
  return (
    <div className="text-center py-6 text-gray-500">
      <div className="text-2xl mb-2">✅</div>
      <p className="text-sm font-medium text-gray-900">Tüm görevler tamamlandı!</p>
      <p className="text-xs text-gray-400 mt-1">Yeni görev eklemek için yukarıdaki + butonunu kullanın</p>
    </div>
  );
}

// Loading state component
function ActiveTasksLoadingState() {
  return (
    <div className="text-center py-4">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
      <span className="text-sm text-gray-500 mt-2 block">Aktif görevler yükleniyor...</span>
    </div>
  );
}

// Main ActiveTasksSection component
export default function ActiveTasksSection({ 
  tasks, 
  loading = false, 
  onTaskClick, 
  onDeleteTask 
}: ActiveTasksSectionProps) {
  
  if (loading) {
    return <ActiveTasksLoadingState />;
  }

  return (
    <div className="mb-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900 flex items-center">
          <span className="mr-2">📋</span>
          Aktif Görevler
        </h4>
        <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">
          {tasks.length} görev
        </span>
      </div>

      {/* Tasks Content */}
      {tasks.length === 0 ? (
        <NoActiveTasksState />
      ) : (
        <div>
          {/* Table Header */}
          <ActiveTasksTableHeader />
          
          {/* Tasks List */}
          <div className="border border-gray-200 border-t-0 rounded-b-lg">
            {tasks.map((task) => (
              <TaskRow 
                key={task.id} 
                task={task} 
                onTaskClick={onTaskClick}
                onDeleteTask={onDeleteTask}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}