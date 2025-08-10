'use client';

import { useState, useEffect } from 'react';
import { useProjects, useTasks, useTaskOperations, useProjectOperations } from '@/hooks';
import { createProject } from '@/lib/firebase-operations';
import { Project } from '@/lib/types';
import { TaskRow } from '@/components/tasks';
import CreateProjectModal from './CreateProjectModal';

// Simple inline project creation form
function CreateProjectForm({ onClose }: { onClose: () => void }) {
  const [projectName, setProjectName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      setError('Proje ismi gereklidir');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createProject({ name: projectName.trim() });
      console.log('Project created successfully:', projectName);
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Proje oluşturulurken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 className="text-lg font-semibold mb-4">Yeni Proje Oluştur</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-1">
              Proje İsmi
            </label>
            <input
              id="project-name"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Örn: E-Ticaret Platformu, Mobil Uygulama..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
              autoFocus
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="text-sm text-gray-500">
            <p>💡 İpucu: Proje oluşturduktan sonra görevler ekleyebilirsiniz.</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button 
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              İptal
            </button>
            <button 
              type="submit"
              disabled={isLoading || !projectName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Oluşturuluyor...
                </>
              ) : (
                'Proje Oluştur'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


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
                  handleCreateTask();
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
      )}
    </div>
  );
}

// Main ProjectAccordion component
export default function ProjectAccordion() {
  const { projects, loading, error } = useProjects();
  const { handleCreateProject } = useProjectOperations();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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