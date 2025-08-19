'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/lib/types';

interface CompletedTasksAccordionProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDeleteTask: (taskId: string, taskTitle: string) => void;
}

// Completed task row component with muted styling
function CompletedTaskRow({ 
  task, 
  onTaskClick, 
  onDeleteTask 
}: { 
  task: Task; 
  onTaskClick: (task: Task) => void; 
  onDeleteTask: (taskId: string, taskTitle: string) => void;
}) {
  const handleTaskClick = () => {
    onTaskClick(task);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteTask(task.id, task.title);
  };


  return (
    <div 
      className="grid grid-cols-12 gap-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 px-3 py-3 cursor-pointer transition-colors opacity-75"
      onClick={handleTaskClick}
    >
      {/* Görev - 5 columns */}
      <div className="col-span-5 flex items-center min-w-0">
        <div className="flex items-center space-x-2">
          <span className="text-green-500 text-sm">✓</span>
          <h5 className="font-medium text-gray-600 text-sm truncate line-through">
            {task.title}
          </h5>
        </div>
      </div>
      
      {/* Öncelik - 2 columns */}
      <div className="col-span-2 flex items-center justify-center">
        <span className="px-1.5 py-0.5 text-xs font-medium rounded-full border bg-gray-100 text-gray-500 border-gray-200">
          {task.priority}
        </span>
      </div>
      
      {/* Süre - 1 column */}
      <div className="col-span-1 flex items-center justify-center">
        <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${
          task.estimatedDuration === 'Kısa' ? 'bg-blue-50 text-blue-600' :
          task.estimatedDuration === 'Orta' ? 'bg-gray-100 text-gray-600' :
          'bg-orange-50 text-orange-600'
        }`}>
          {task.estimatedDuration}
        </span>
      </div>
      
      {/* Durum - 2 columns */}
      <div className="col-span-2 flex items-center justify-center">
        <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-green-100 text-green-700">
          Yapıldı
        </span>
      </div>
      
      {/* Tarih - 2 columns */}
      <div className="col-span-2 flex items-center justify-center space-x-1">
        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
          {task.deadline.toLocaleDateString('tr-TR', { 
            day: 'numeric', 
            month: 'short' 
          })}
        </span>
        
        {/* Delete button */}
        <button
          onClick={handleDeleteClick}
          className="text-gray-400 hover:text-red-600 transition-colors p-1 ml-1"
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

// Table header for completed tasks
function CompletedTasksTableHeader() {
  return (
    <div className="grid grid-cols-12 gap-2 bg-green-50 border-b border-green-200 text-xs font-medium text-green-700 px-3 py-2 rounded-t-lg">
      <div className="col-span-5">Görev</div>
      <div className="col-span-2 text-center">Öncelik</div>
      <div className="col-span-1 text-center">Süre</div>
      <div className="col-span-2 text-center">Durum</div>
      <div className="col-span-2 text-center">Tarih</div>
    </div>
  );
}

// Main CompletedTasksAccordion component
export default function CompletedTasksAccordion({ 
  tasks, 
  onTaskClick, 
  onDeleteTask 
}: CompletedTasksAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
    // Try to restore state from localStorage
    const storageKey = 'completedTasksExpanded';
    const savedState = localStorage.getItem(storageKey);
    if (savedState !== null) {
      setIsExpanded(savedState === 'true');
    }
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('completedTasksExpanded', isExpanded.toString());
    }
  }, [isExpanded, mounted]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Don't render if no completed tasks
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="border border-green-200 rounded-lg bg-green-50/30 shadow-sm">
      {/* Accordion Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-green-50 transition-colors rounded-t-lg"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Expand/Collapse Icon */}
            <button className="text-green-600 hover:text-green-700 transition-colors">
              {isExpanded ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
            
            {/* Section Title */}
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✅</span>
              <h4 className="text-sm font-medium text-green-800">
                Tamamlanan Görevler
              </h4>
            </div>
          </div>
          
          {/* Task Count Badge */}
          <div className="flex items-center">
            <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
              {tasks.length} görev
            </span>
          </div>
        </div>
      </div>

      {/* Accordion Content */}
      {isExpanded && (
        <div className="border-t border-green-200">
          {/* Table Header */}
          <CompletedTasksTableHeader />
          
          {/* Tasks List */}
          <div className="bg-white border-x border-b border-green-200 rounded-b-lg">
            {tasks.map((task) => (
              <CompletedTaskRow
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