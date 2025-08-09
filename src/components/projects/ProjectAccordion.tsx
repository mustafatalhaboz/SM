'use client';

import { useState } from 'react';
import { useProjects, useTasks } from '@/hooks';
import { Project, Task } from '@/lib/types';

// Task row component (reused from dashboard)
function TaskRow({ task }: { task: Task }) {
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
  
  return (
    <div className="bg-gray-50 border rounded-lg p-3 hover:bg-white transition-colors">
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

// Individual project accordion item
function ProjectItem({ project }: { project: Project }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks(project.id);
  
  // Calculate completion stats
  const completedTasks = tasks.filter(task => task.status === 'Yapıldı').length;
  const totalTasks = tasks.length;
  
  const toggleExpand = () => setIsExpanded(!isExpanded);
  
  return (
    <div className="bg-white border rounded-lg shadow-sm">
      {/* Accordion Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={toggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Expand/Collapse Icon */}
            <button className="text-gray-400 hover:text-gray-600">
              {isExpanded ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
            
            {/* Project Name */}
            <h3 className="font-semibold text-gray-900">{project.name}</h3>
          </div>
          
          {/* Task Counter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {completedTasks}/{totalTasks} tamamlandı
            </span>
            {totalTasks > 0 && (
              <div className="flex">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  completedTasks === totalTasks 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {Math.round((completedTasks / totalTasks) * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Accordion Content */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="border-t pt-4">
            {/* Add Task Button */}
            <div className="mb-4">
              <button 
                className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement add task functionality
                  console.log('Add task for project:', project.id);
                }}
              >
                + Yeni Görev Ekle
              </button>
            </div>
            
            {/* Tasks List */}
            <div className="space-y-2">
              {tasksLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
                  <span className="text-sm text-gray-500 mt-2 block">Görevler yükleniyor...</span>
                </div>
              ) : tasksError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">Hata: {tasksError}</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <div className="text-2xl mb-2">📋</div>
                  <p className="text-sm">Bu projede henüz görev yok</p>
                  <p className="text-xs text-gray-400 mt-1">Yukarıdaki butonu kullanarak yeni görev ekleyebilirsiniz</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main ProjectAccordion component
export default function ProjectAccordion() {
  const { projects, loading, error } = useProjects();
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Projeler yükleniyor...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-400">⚠️</div>
          <div className="ml-2">
            <h3 className="font-medium text-red-800">Proje Yükleme Hatası</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6 text-center">
        <div className="text-gray-400 mb-2">📁</div>
        <h3 className="font-medium text-gray-900 mb-1">Henüz proje yok</h3>
        <p className="text-sm text-gray-500 mb-4">
          İlk projenizi oluşturarak başlayın.
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          + Yeni Proje Oluştur
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Projeler
        </h2>
        <span className="text-sm text-gray-500">
          {projects.length} proje
        </span>
      </div>
      
      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((project) => (
          <ProjectItem key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}