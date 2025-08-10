import { Task, TaskStatus, TaskType, TaskPriority } from '@/lib/types';

// Default task values
export const TASK_DEFAULTS = {
  STATUS: 'Yapılacak' as TaskStatus,
  TYPE: 'Operasyon' as TaskType,
  PRIORITY: 'Orta' as TaskPriority,
  DEADLINE_DAYS: 7,
  DESCRIPTION: '',
  ASSIGNED_PERSON: ''
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
Atanan: ${task.assignedPerson || 'Atanmamış'}
Durum: ${task.status}
Tip: ${task.type}
Öncelik: ${task.priority}
Termin: ${task.deadline.toLocaleDateString('tr-TR')}
  `.trim();
};