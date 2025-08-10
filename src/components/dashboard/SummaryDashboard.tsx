'use client';

import { useHighPriorityTasksWithProjects } from '@/hooks';
import { TaskWithProject } from '@/lib/types';
import { updateTask } from '@/lib/firebase-operations';
import { logger } from '@/lib/logger';

// Priority badge component
function PriorityBadge({ priority }: { priority: TaskWithProject['priority'] }) {
  const colors = {
    'Yüksek': 'bg-red-100 text-red-800 border-red-200',
    'Orta': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Düşük': 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full border ${colors[priority]}`}>
      {priority}
    </span>
  );
}

// Status badge component
function StatusBadge({ status }: { status: TaskWithProject['status'] }) {
  const colors = {
    'Yapılacak': 'bg-gray-100 text-gray-800',
    'Yapılıyor': 'bg-blue-100 text-blue-800',
    'Beklemede': 'bg-orange-100 text-orange-800',
    'Blocked': 'bg-red-100 text-red-800',
    'Yapıldı': 'bg-green-100 text-green-800'
  };

  return (
    <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${colors[status]}`}>
      {status}
    </span>
  );
}

// Task row component (table format)
function TaskRow({ task, onCompleteTask }: { task: TaskWithProject; onCompleteTask: (taskId: string) => void }) {
  const isOverdue = task.deadline < new Date();

  const handleCompleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onCompleteTask(task.id);
  };
  
  return (
    <div className="grid grid-cols-12 gap-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 px-3 py-3 transition-colors">
      {/* Proje - 2 columns */}
      <div className="col-span-2 sm:col-span-2 flex items-center">
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 truncate">
          {task.projectName}
        </span>
      </div>
      
      {/* Görev - 3 columns */}
      <div className="col-span-4 sm:col-span-3 flex items-center min-w-0">
        <h4 className="font-medium text-gray-900 text-sm truncate">
          {task.title}
        </h4>
      </div>
      
      {/* Öncelik - 2 columns */}
      <div className="col-span-2 flex items-center justify-center">
        <PriorityBadge priority={task.priority} />
      </div>
      
      {/* Tür - 1 column, hidden on mobile */}
      <div className="col-span-1 hidden sm:flex items-center justify-center">
        <span className="text-xs text-gray-600 capitalize">{task.type}</span>
      </div>
      
      {/* Durum - 2 columns */}
      <div className="col-span-2 flex items-center justify-center">
        <StatusBadge status={task.status} />
      </div>
      
      {/* Kişi - 1 column, hidden on mobile */}
      <div className="col-span-1 hidden sm:flex items-center justify-center">
        <span className="text-xs text-gray-400 truncate">
          {task.assignedPerson || 'Atanmamış'}
        </span>
      </div>
      
      {/* Tarih - 1 column */}
      <div className="col-span-2 sm:col-span-1 flex items-center justify-center space-x-1">
        <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-gray-600'} whitespace-nowrap`}>
          {task.deadline.toLocaleDateString('tr-TR', { 
            day: 'numeric', 
            month: 'short' 
          })}
          {isOverdue && ' ⚠️'}
        </span>
        
        {/* Complete button */}
        <button
          onClick={handleCompleteClick}
          className="text-green-500 hover:text-green-700 transition-colors p-1 ml-1"
          title="Görevi tamamla"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

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

  // Handle task completion
  const handleCompleteTask = async (taskId: string) => {
    try {
      await updateTask(taskId, { status: 'Yapıldı' });
      logger.debug('Task marked as completed from dashboard', { taskId });
    } catch (error) {
      logger.error('Failed to complete task from dashboard', { taskId, error });
    }
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

  if (tasks.length === 0) {
    return <EmptyState />;
  }

  // Limit to max 10 tasks
  const displayTasks = tasks.slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Yüksek Öncelikli Görevler
        </h2>
        <span className="text-sm text-gray-500">
          {displayTasks.length} / {tasks.length} görev
        </span>
      </div>

      {/* Tasks List */}
      <div>
        {/* Table Header - only show when tasks exist */}
        {displayTasks.length > 0 && (
          <div className="grid grid-cols-12 gap-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 px-3 py-2 rounded-t-lg">
            <div className="col-span-2">Proje</div>
            <div className="col-span-4 sm:col-span-3">Görev</div>
            <div className="col-span-2 text-center">Öncelik</div>
            <div className="col-span-1 text-center hidden sm:block">Tür</div>
            <div className="col-span-2 text-center">Durum</div>
            <div className="col-span-1 text-center hidden sm:block">Kişi</div>
            <div className="col-span-2 sm:col-span-1 text-center">Tarih</div>
          </div>
        )}
        
        {/* Tasks Table */}
        <div className={displayTasks.length > 0 ? "border border-gray-200 rounded-b-lg" : ""}>
          {displayTasks.map((task) => (
            <TaskRow key={task.id} task={task} onCompleteTask={handleCompleteTask} />
          ))}
        </div>
      </div>

      {/* Show more indicator if there are more than 10 tasks */}
      {tasks.length > 10 && (
        <div className="text-center">
          <p className="text-sm text-gray-500">
            +{tasks.length - 10} görev daha var
          </p>
        </div>
      )}
    </div>
  );
}