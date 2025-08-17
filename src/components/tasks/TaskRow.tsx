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
      className="grid grid-cols-12 gap-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 px-3 py-3 cursor-pointer transition-colors"
      onClick={handleTaskClick}
    >
      {/* Görev - 6 columns */}
      <div className="col-span-6 flex items-center min-w-0">
        <h5 className="font-medium text-gray-900 text-sm truncate">
          {task.title}
        </h5>
      </div>
      
      {/* Öncelik - 2 columns */}
      <div className="col-span-2 flex items-center justify-center">
        <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full border ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      
      {/* Durum - 2 columns */}
      <div className="col-span-2 flex items-center justify-center">
        <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${statusColors[task.status]}`}>
          {task.status}
        </span>
      </div>
      
      {/* Tarih - 2 columns */}
      <div className="col-span-2 flex items-center justify-center space-x-1">
        <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-gray-600'} whitespace-nowrap`}>
          {task.deadline.toLocaleDateString('tr-TR', { 
            day: 'numeric', 
            month: 'short' 
          })}
          {isOverdue && ' ⚠️'}
        </span>
        
        {/* Delete button */}
        <button
          onClick={handleDeleteClick}
          className="text-red-400 hover:text-red-600 transition-colors p-1 ml-1"
          title="Görevi sil"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}