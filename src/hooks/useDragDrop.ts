import { useState } from 'react';
import { Project } from '@/lib/types';
import { reorderProjects } from '@/lib/firebase-operations';
import { logger } from '@/lib/logger';

export interface DragDropState {
  draggedProject: Project | null;
  dropTarget: string | null; // project ID
  isDragging: boolean;
}

interface UseDragDropReturn {
  dragDropState: DragDropState;
  handleDragStart: (project: Project) => void;
  handleDragEnd: () => void;
  handleDragOver: (e: React.DragEvent, projectId: string) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent, targetProjectId: string, projects: Project[]) => void;
  reorderProjectsLocally: (projects: Project[], draggedId: string, targetId: string) => Project[];
}

export function useDragDrop(): UseDragDropReturn {
  const [dragDropState, setDragDropState] = useState<DragDropState>({
    draggedProject: null,
    dropTarget: null,
    isDragging: false
  });

  const handleDragStart = (project: Project) => {
    setDragDropState({
      draggedProject: project,
      dropTarget: null,
      isDragging: true
    });
    logger.info('Drag started', { projectId: project.id, projectName: project.name });
  };

  const handleDragEnd = () => {
    setDragDropState({
      draggedProject: null,
      dropTarget: null,
      isDragging: false
    });
    logger.info('Drag ended');
  };

  const handleDragOver = (e: React.DragEvent, projectId: string) => {
    e.preventDefault(); // Allow drop
    
    // Don't show drop target for same element
    if (dragDropState.draggedProject?.id === projectId) {
      return;
    }
    
    setDragDropState(prev => ({
      ...prev,
      dropTarget: projectId
    }));
  };

  const handleDragLeave = () => {
    setDragDropState(prev => ({
      ...prev,
      dropTarget: null
    }));
  };

  const reorderProjectsLocally = (projects: Project[], draggedId: string, targetId: string): Project[] => {
    const draggedIndex = projects.findIndex(p => p.id === draggedId);
    const targetIndex = projects.findIndex(p => p.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      return projects;
    }
    
    const reorderedProjects = [...projects];
    const draggedProject = reorderedProjects.splice(draggedIndex, 1)[0];
    reorderedProjects.splice(targetIndex, 0, draggedProject!);
    
    return reorderedProjects;
  };

  const handleDrop = async (e: React.DragEvent, targetProjectId: string, projects: Project[]) => {
    e.preventDefault();
    
    const draggedProject = dragDropState.draggedProject;
    if (!draggedProject || draggedProject.id === targetProjectId) {
      handleDragEnd();
      return;
    }

    try {
      // Optimistic update - reorder locally first
      const reorderedProjects = reorderProjectsLocally(projects, draggedProject.id, targetProjectId);
      const projectIds = reorderedProjects.map(p => p.id);
      
      // Update Firebase with new order
      await reorderProjects(projectIds);
      
      logger.info('Projects reordered successfully');
      
    } catch (error) {
      logger.error('Failed to reorder projects', { error });
      // Error handling will be done by the UI component
      throw error;
    } finally {
      handleDragEnd();
    }
  };

  return {
    dragDropState,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    reorderProjectsLocally
  };
}