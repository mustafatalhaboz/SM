'use client';

import { Task } from '@/lib/types';

interface TaskRowProps {
  task: Task;
  onTaskClick: (task: Task) => void;
  onDeleteTask: (taskId: string, taskTitle: string) => void;
}

export default function TaskRow({ task, onTaskClick, onDeleteTask }: TaskRowProps) {
  const isOverdue = task.deadline < new Date();

  const statusColors = {
    'Yapılacak': 'bg-gray-100 text-gray-800',
    'Yapılıyor': 'bg-blue-100 text-blue-800',
    'Beklemede': 'bg-orange-100 text-orange-800',
    'Blocked': 'bg-red-100 text-red-800',
    'Yapıldı': 'bg-green-100 text-green-800'
  };

  const priorityColors = {
    'Yüksek': 'bg-red-100 text-red-800 border-red-200',
    'Orta': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Düşük': 'bg-green-100 text-green-800 border-green-200'
  };

  const handleTaskClick = () => {
    onTaskClick(task);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteTask(task.id, task.title);
  };

  return (
    <div 
      className="bg-gray-50 border rounded-lg p-3 hover:bg-white transition-colors cursor-pointer"
      onClick={handleTaskClick}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Title and badges */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <h5 className="font-medium text-gray-900 text-sm truncate flex-1">
            {task.title}
          </h5>
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[task.status]}`}>
            {task.status}
          </span>
        </div>
        
        {/* Right side - Type, person, deadline, delete button */}
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
          
          {/* Delete button */}
          <button
            onClick={handleDeleteClick}
            className="text-red-400 hover:text-red-600 transition-colors p-1"
            title="Görevi sil"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}