'use client';

import { useState, useEffect } from 'react';
import { useProjects, useFilteredTasks, useTaskOperations, useProjectOperations, useDragDrop } from '@/hooks';
import { Project } from '@/lib/types';
import { ActiveTasksSection, CompletedTasksAccordion } from '@/components/projects';



// Individual project accordion item
function ProjectItem({ 
  project, 
  projects, 
  dragDropState, 
  onDragStart, 
  onDragEnd, 
  onDragOver, 
  onDragLeave, 
  onDrop 
}: { 
  project: Project;
  projects: Project[];
  dragDropState: {
    draggedProject: Project | null;
    dropTarget: string | null;
    isDragging: boolean;
  };
  onDragStart: (project: Project) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, projectId: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, targetProjectId: string, projects: Project[]) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    activeTasks, 
    completedTasks, 
    totalTasks, 
    completedCount, 
    completionRate, 
    loading: tasksLoading, 
    error: tasksError 
  } = useFilteredTasks(project.id);
  const { handleCreateTask, handleDeleteTask, handleTaskClick } = useTaskOperations({ projectId: project.id });
  
  // Drag & drop states
  const isDraggedItem = dragDropState.draggedProject?.id === project.id;
  const isDropTarget = dragDropState.dropTarget === project.id;
  
  const toggleExpand = () => setIsExpanded(!isExpanded);
  
  return (
    <div 
      className={`bg-white border rounded-lg shadow-sm transition-all duration-200 ${
        isDraggedItem 
          ? 'opacity-50 shadow-lg scale-105' 
          : isDropTarget 
            ? 'border-blue-500 border-2 shadow-md' 
            : 'hover:shadow-md'
      }`}
      draggable={!isExpanded}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(project);
      }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOver(e, project.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, project.id, projects)}
    >
      {/* Accordion Header */}
      <div 
        className={`p-4 transition-colors ${
          !isExpanded ? 'cursor-move' : 'cursor-pointer hover:bg-gray-50'
        }`}
        onClick={isExpanded ? toggleExpand : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Drag Handle - Only show when collapsed */}
            {!isExpanded && (
              <div 
                className="drag-handle text-gray-400 hover:text-gray-600 cursor-move p-1"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
                </svg>
              </div>
            )}
            {/* Expand/Collapse Icon */}
            <button 
              className="text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand();
              }}
            >
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
          
          {/* Task Counter with Progress */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              {activeTasks.length} aktif, {completedCount} tamamlandı
            </span>
            {totalTasks > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600 font-medium">
                  {completionRate}%
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
            {/* Tasks Container */}
            <div className="mb-4">
              {/* Removed full-width button - now using + icon in header */}
            </div>
            
            {/* Tasks Sections */}
            <div className="space-y-4">
              {tasksError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">Hata: {tasksError}</p>
                </div>
              ) : totalTasks === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <div className="text-2xl mb-2">📋</div>
                  <p className="text-sm">Bu projede henüz görev yok</p>
                  <p className="text-xs text-gray-400 mt-1">Yukarıdaki + butonunu kullanarak yeni görev ekleyebilirsiniz</p>
                </div>
              ) : (
                <>
                  {/* Active Tasks Section */}
                  <ActiveTasksSection
                    tasks={activeTasks}
                    loading={tasksLoading}
                    onTaskClick={handleTaskClick}
                    onDeleteTask={handleDeleteTask}
                  />
                  
                  {/* Completed Tasks Accordion */}
                  <CompletedTasksAccordion
                    tasks={completedTasks}
                    onTaskClick={handleTaskClick}
                    onDeleteTask={handleDeleteTask}
                  />
                </>
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
  const [isMounted, setIsMounted] = useState(false);
  
  // Drag & Drop functionality
  const {
    dragDropState,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop
  } = useDragDrop();

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
          <ProjectItem 
            key={project.id} 
            project={project}
            projects={projects}
            dragDropState={dragDropState}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />
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