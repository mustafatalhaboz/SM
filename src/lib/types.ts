// Firebase Firestore timestamp import
import { Timestamp } from 'firebase/firestore';

// Status options for tasks
export type TaskStatus = 'Yapılacak' | 'Yapılıyor' | 'Beklemede' | 'Blocked' | 'Yapıldı';


// Priority options for tasks
export type TaskPriority = 'Yüksek' | 'Orta' | 'Düşük';

// Type options for tasks
export type TaskType = 'Operasyon' | 'Yönlendirme' | 'Takip';

// Duration options for tasks (time-based)
export type TaskDuration = '15dk' | '30dk' | '1saat' | '1.5saat' | '2saat';

// Project interface based on CLAUDE.md data model
export interface Project {
  id: string;
  name: string;
  createdAt: Timestamp;
  order: number; // For drag & drop reordering
}

// Task interface based on CLAUDE.md data model
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedPerson: string;
  status: TaskStatus;
  type: TaskType;
  priority: TaskPriority;
  estimatedDuration: TaskDuration;
  deadline: Date;
  createdAt: Timestamp;
}

// Task with project information (for dashboard)
export interface TaskWithProject extends Task {
  projectName: string;
}

// CRUD operation types for creating projects
export interface CreateProjectData {
  name: string;
  order?: number; // Optional for create, auto-generated if not provided
}

// CRUD operation types for updating projects
export interface UpdateProjectData {
  name?: string;
  order?: number;
}

// CRUD operation types for creating tasks
export interface CreateTaskData {
  projectId: string;
  title: string;
  description?: string;
  assignedPerson?: string;
  status?: TaskStatus;
  type?: TaskType;
  priority?: TaskPriority;
  estimatedDuration?: TaskDuration;
  deadline?: Date;
}

// Default values for quick task creation
export const DEFAULT_TASK_VALUES: Partial<CreateTaskData> = {
  status: 'Yapılacak',
  priority: 'Orta',
  estimatedDuration: '30dk',
  description: ''
};

// CRUD operation types for updating tasks
export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  estimatedDuration?: TaskDuration;
  deadline?: Date;
}

// Utility type for task with optional id (for forms)
export type TaskFormData = Omit<Task, 'id' | 'createdAt'>;

// Utility type for project with optional id (for forms)
export type ProjectFormData = Omit<Project, 'id' | 'createdAt'>;

// Arrays for dropdown options (for UI components)
export const TASK_STATUS_OPTIONS: TaskStatus[] = ['Yapılacak', 'Yapılıyor', 'Beklemede', 'Blocked', 'Yapıldı'];
export const TASK_PRIORITY_OPTIONS: TaskPriority[] = ['Yüksek', 'Orta', 'Düşük'];
export const TASK_DURATION_OPTIONS: TaskDuration[] = ['15dk', '30dk', '1saat', '1.5saat', '2saat'];

// Duration utility functions for sorting and comparison
export function getDurationInMinutes(duration: TaskDuration | string): number {
  switch (duration) {
    case '15dk': return 15;
    case '30dk': return 30;
    case '1saat': return 60;
    case '1.5saat': return 90;
    case '2saat': return 120;
    // Fallback for old values during migration
    case 'Kısa': return 30; // Equivalent to 30dk
    case 'Orta': return 60; // Equivalent to 1saat  
    case 'Uzun': return 120; // Equivalent to 2saat
    default: return 60; // Default to 1 hour
  }
}

// Task sorting functions
export function sortTasksByDuration(tasks: Task[], ascending: boolean = true): Task[] {
  return [...tasks].sort((a, b) => {
    const durationA = getDurationInMinutes(a.estimatedDuration);
    const durationB = getDurationInMinutes(b.estimatedDuration);
    return ascending ? durationA - durationB : durationB - durationA;
  });
}

// Duration aggregation functions
export function getTotalDurationMinutes(tasks: Task[]): number {
  return tasks.reduce((total, task) => total + getDurationInMinutes(task.estimatedDuration), 0);
}

export function formatDurationDisplay(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}dk`;
  } else if (minutes === 60) {
    return '1saat';
  } else if (minutes < 120) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}s ${remainingMinutes}dk` : `${hours}saat`;
  } else {
    const hours = minutes / 60;
    return hours % 1 === 0 ? `${hours}saat` : `${hours.toFixed(1)}saat`;
  }
}