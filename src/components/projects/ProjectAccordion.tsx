'use client';

import { useState, useEffect } from 'react';
import { useProjects, useTasks, useTaskOperations, useProjectOperations } from '@/hooks';
import { Project } from '@/lib/types';
import { TaskRow } from '@/components/tasks';



// Individual project accordion item
function ProjectItem({ project }: { project: Project }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks(project.id);
  const { handleCreateTask, handleDeleteTask, handleTaskClick } = useTaskOperations({ projectId: project.id });
  
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
            
            {/* Project Name with Add Task Icon */}
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{project.name}</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateTask();
                }}
                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Yeni görev ekle"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Task Counter */}
          <div className="flex items-center">
            <span className="text-sm text-gray-500">
              {totalTasks} görev
              {completedTasks > 0 && (
                <span className="text-green-600"> ({completedTasks} tamamlandı)</span>
              )}
            </span>
          </div>
        </div>
      </div>
      
      {/* Accordion Content */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="border-t pt-4">
            {/* Tasks Container */}
            <div className="mb-4">
              {/* Removed full-width button - now using + icon in header */}
            </div>
            
            {/* Tasks List */}
            <div>
              {/* Table Header - only show when tasks exist */}
              {tasks.length > 0 && (
                <div className="grid grid-cols-12 gap-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 px-3 py-2 rounded-t-lg">
                  <div className="col-span-6 sm:col-span-4">Görev</div>
                  <div className="col-span-2 text-center">Öncelik</div>
                  <div className="col-span-2 text-center hidden sm:block">Tür</div>
                  <div className="col-span-2 text-center">Durum</div>
                  <div className="col-span-1 text-center hidden sm:block">Kişi</div>
                  <div className="col-span-2 sm:col-span-1 text-center">Tarih</div>
                </div>
              )}
              
              {/* Tasks Table */}
              <div className={tasks.length > 0 ? "" : "space-y-2"}>
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
                  <TaskRow 
                    key={task.id} 
                    task={task} 
                    onTaskClick={handleTaskClick}
                    onDeleteTask={handleDeleteTask}
                  />
                ))
              )}
              </div>
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
  const { handleCreateProject } = useProjectOperations();
  const [isMounted, setIsMounted] = useState(false);

  // Fix hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Yükleniyor...</span>
        </div>
      </div>
    );
  }
  
  
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
        <button 
          onClick={handleCreateProject}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
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

      {/* Add Project Button for existing projects */}
      <div className="text-center">
        <button
          onClick={handleCreateProject}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          + Yeni Proje Ekle
        </button>
      </div>

    </div>
  );
}