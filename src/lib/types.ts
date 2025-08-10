// Firebase Firestore timestamp import
import { Timestamp } from 'firebase/firestore';

// Status options for tasks
export type TaskStatus = 'Yapılacak' | 'Yapılıyor' | 'Beklemede' | 'Blocked' | 'Yapıldı';

// Type options for tasks
export type TaskType = 'Operasyon' | 'Yönlendirme' | 'Takip';

// Priority options for tasks
export type TaskPriority = 'Yüksek' | 'Orta' | 'Düşük';

// Project interface based on CLAUDE.md data model
export interface Project {
  id: string;
  name: string;
  createdAt: Timestamp;
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
  deadline?: Date;
}

// Default values for quick task creation
export const DEFAULT_TASK_VALUES: Partial<CreateTaskData> = {
  status: 'Yapılacak',
  type: 'Operasyon',
  priority: 'Orta',
  description: '',
  assignedPerson: ''
};

// CRUD operation types for updating tasks
export interface UpdateTaskData {
  title?: string;
  description?: string;
  assignedPerson?: string;
  status?: TaskStatus;
  type?: TaskType;
  priority?: TaskPriority;
  deadline?: Date;
}

// Utility type for task with optional id (for forms)
export type TaskFormData = Omit<Task, 'id' | 'createdAt'>;

// Utility type for project with optional id (for forms)
export type ProjectFormData = Omit<Project, 'id' | 'createdAt'>;

// Arrays for dropdown options (for UI components)
export const TASK_STATUS_OPTIONS: TaskStatus[] = ['Yapılacak', 'Yapılıyor', 'Beklemede', 'Blocked', 'Yapıldı'];
export const TASK_TYPE_OPTIONS: TaskType[] = ['Operasyon', 'Yönlendirme', 'Takip'];  
export const TASK_PRIORITY_OPTIONS: TaskPriority[] = ['Yüksek', 'Orta', 'Düşük'];