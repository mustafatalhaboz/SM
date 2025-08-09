'use client';

import { useHighPriorityTasks } from '@/hooks';
import { Task } from '@/lib/types';

// Priority badge component
function PriorityBadge({ priority }: { priority: Task['priority'] }) {
  const colors = {
    'Yüksek': 'bg-red-100 text-red-800 border-red-200',
    'Orta': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Düşük': 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[priority]}`}>
      {priority}
    </span>
  );
}

// Status badge component
function StatusBadge({ status }: { status: Task['status'] }) {
  const colors = {
    'Yapılacak': 'bg-gray-100 text-gray-800',
    'Yapılıyor': 'bg-blue-100 text-blue-800',
    'Beklemede': 'bg-orange-100 text-orange-800',
    'Blocked': 'bg-red-100 text-red-800',
    'Yapıldı': 'bg-green-100 text-green-800'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${colors[status]}`}>
      {status}
    </span>
  );
}

// Task row component (horizontal layout)
function TaskRow({ task }: { task: Task }) {
  const isOverdue = task.deadline < new Date();
  
  return (
    <div className="bg-white border rounded-lg p-3 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        {/* Left side - Title and badges */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm truncate flex-1">
            {task.title}
          </h4>
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </div>
        
        {/* Right side - Type, person, deadline */}
        <div className="flex items-center space-x-4 text-xs text-gray-500 ml-4">
          <span className="capitalize min-w-0">{task.type}</span>
          <span className="text-gray-400 min-w-0">
            {task.assignedPerson || 'Atanmamış'}
          </span>
          <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-600'} whitespace-nowrap`}>
            {task.deadline.toLocaleDateString('tr-TR', { 
              day: 'numeric', 
              month: 'short' 
            })}
            {isOverdue && ' ⚠️'}
          </span>
        </div>
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
  const { tasks, loading, error } = useHighPriorityTasks();

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
      <div className="space-y-2">
        {displayTasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
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