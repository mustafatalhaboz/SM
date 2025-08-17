import { Task, TaskStatus, TaskPriority } from '@/lib/types';

// Default task values
export const TASK_DEFAULTS = {
  STATUS: 'Yapılacak' as TaskStatus,
  PRIORITY: 'Orta' as TaskPriority,
  DEADLINE_DAYS: 7,
  DESCRIPTION: ''
} as const;

// UI Messages for task operations
export const TASK_MESSAGES = {
  // Prompts
  CREATION_PROMPT: 'Yeni görev başlığı:',
  PROJECT_CREATION_PROMPT: 'Yeni proje ismi:',
  
  // Success messages
  TASK_CREATED_SUCCESS: (title: string) => `Görev başarıyla oluşturuldu: ${title}`,
  PROJECT_CREATED_SUCCESS: (name: string) => `Proje başarıyla oluşturuldu: ${name}`,
  TASK_DELETED_SUCCESS: 'Görev başarıyla silindi',
  
  // Confirmation messages
  TASK_DELETE_CONFIRM: (title: string) => `"${title}" görevini silmek istediğinize emin misiniz?`,
  TASK_EDIT_CONFIRM: (details: string) => `${details}\n\nDüzenlemek istiyor musunuz?`,
  
  // Error messages
  TASK_CREATION_ERROR: (error: string) => `Görev oluşturulurken hata oluştu: ${error}`,
  PROJECT_CREATION_ERROR: (error: string) => `Proje oluşturulurken hata oluştu: ${error}`,
  TASK_DELETION_ERROR: (error: string) => `Görev silinirken hata oluştu: ${error}`,
  
  // Validation messages
  TITLE_REQUIRED: 'Görev başlığı gereklidir',
  PROJECT_NAME_REQUIRED: 'Proje ismi gereklidir',
  
  // Section labels
  ACTIVE_TASKS_HEADER: 'Aktif Görevler',
  COMPLETED_TASKS_HEADER: 'Tamamlanan Görevler',
  ALL_TASKS_COMPLETED: 'Tüm görevler tamamlandı!',
  NO_ACTIVE_TASKS: 'Aktif görev yok',
  NO_COMPLETED_TASKS: 'Tamamlanan görev yok',
  
  // Status messages
  LOADING_ACTIVE_TASKS: 'Aktif görevler yükleniyor...',
  LOADING_COMPLETED_TASKS: 'Tamamlanan görevler yükleniyor...',
  
  // Placeholders
  UPCOMING_FEATURE: 'Görev düzenleme modalı yakında eklenecek!'
} as const;

// Helper function for default task deadline
export const getDefaultDeadline = (): Date => {
  return new Date(Date.now() + TASK_DEFAULTS.DEADLINE_DAYS * 24 * 60 * 60 * 1000);
};

// Helper function for task detail formatting
export const formatTaskDetails = (task: Task) => {
  return `
Görev: ${task.title}
Açıklama: ${task.description || 'Yok'}
Durum: ${task.status}
Öncelik: ${task.priority}
Termin: ${task.deadline.toLocaleDateString('tr-TR')}
  `.trim();
};