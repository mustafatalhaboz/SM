import { Task, UpdateTaskData, TaskStatus, TaskType, TaskPriority, TASK_STATUS_OPTIONS, TASK_TYPE_OPTIONS, TASK_PRIORITY_OPTIONS } from '@/lib/types';
import { updateTask } from '@/lib/firebase-operations';
import { logger } from '@/lib/logger';

interface TaskEditModalOptions {
  task: Task;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Constants
const MODAL_ID = 'task-edit-modal';
const FORM_ID = 'task-edit-form';

// Security: HTML escaping function
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Date formatting with error handling
const formatDateForInput = (date: Date): string => {
  try {
    if (!date || isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0]!;
    }
    return date.toISOString().split('T')[0]!;
  } catch (error) {
    logger.error('Date formatting error in TaskEditModal', { error });
    return new Date().toISOString().split('T')[0]!;
  }
};

export function createTaskEditModal({ task, onSuccess, onError }: TaskEditModalOptions) {
  // Remove existing modal if any
  const existingModal = document.getElementById(MODAL_ID);
  if (existingModal) {
    existingModal.remove();
  }

  // Create dropdown options HTML with escaping
  const createSelectOptions = (options: readonly string[], selectedValue: string): string => {
    return options.map(option => 
      `<option value="${escapeHtml(option)}" ${option === selectedValue ? 'selected' : ''}>${escapeHtml(option)}</option>`
    ).join('');
  };

  // Create modal HTML with accessibility and constants
  const modalHTML = `
    <div id="${MODAL_ID}" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b">
          <h2 id="modal-title" class="text-lg font-semibold text-gray-900">Görev Düzenle</h2>
          <button id="close-modal" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form id="${FORM_ID}" class="p-6 space-y-4">
          <!-- Title -->
          <div>
            <label for="task-title" class="block text-sm font-medium text-gray-700 mb-1">
              Görev Başlığı *
            </label>
            <input 
              type="text" 
              id="task-title" 
              value="${escapeHtml(task.title)}"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              maxlength="200"
            />
            <div id="title-error" class="hidden text-sm text-red-600 mt-1"></div>
          </div>

          <!-- Description -->
          <div>
            <label for="task-description" class="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea 
              id="task-description" 
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Görev açıklaması..."
              maxlength="1000"
            >${escapeHtml(task.description || '')}</textarea>
          </div>

          <!-- Status, Type, Priority - Row -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Status -->
            <div>
              <label for="task-status" class="block text-sm font-medium text-gray-700 mb-1">
                Durum
              </label>
              <select 
                id="task-status"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                ${createSelectOptions(TASK_STATUS_OPTIONS, task.status)}
              </select>
            </div>

            <!-- Type -->
            <div>
              <label for="task-type" class="block text-sm font-medium text-gray-700 mb-1">
                Tip
              </label>
              <select 
                id="task-type"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                ${createSelectOptions(TASK_TYPE_OPTIONS, task.type)}
              </select>
            </div>

            <!-- Priority -->
            <div>
              <label for="task-priority" class="block text-sm font-medium text-gray-700 mb-1">
                Öncelik
              </label>
              <select 
                id="task-priority"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                ${createSelectOptions(TASK_PRIORITY_OPTIONS, task.priority)}
              </select>
            </div>
          </div>

          <!-- Assigned Person and Deadline - Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Assigned Person -->
            <div>
              <label for="task-assigned" class="block text-sm font-medium text-gray-700 mb-1">
                Atanan Kişi
              </label>
              <input 
                type="text" 
                id="task-assigned" 
                value="${escapeHtml(task.assignedPerson || '')}"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Kişi ismi..."
                maxlength="100"
              />
            </div>

            <!-- Deadline -->
            <div>
              <label for="task-deadline" class="block text-sm font-medium text-gray-700 mb-1">
                Termin Tarihi
              </label>
              <input 
                type="date" 
                id="task-deadline" 
                value="${formatDateForInput(task.deadline)}"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end space-x-3 pt-4 border-t">
            <button 
              type="button" 
              id="cancel-button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button 
              type="submit" 
              id="save-button"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <span id="save-text">Kaydet</span>
              <div id="save-spinner" class="hidden animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Add modal to DOM
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Get form elements
  const modal = document.getElementById(MODAL_ID)!;
  const form = document.getElementById(FORM_ID) as HTMLFormElement;
  const titleInput = document.getElementById('task-title') as HTMLInputElement;
  const descriptionInput = document.getElementById('task-description') as HTMLTextAreaElement;
  const statusSelect = document.getElementById('task-status') as HTMLSelectElement;
  const typeSelect = document.getElementById('task-type') as HTMLSelectElement;
  const prioritySelect = document.getElementById('task-priority') as HTMLSelectElement;
  const assignedInput = document.getElementById('task-assigned') as HTMLInputElement;
  const deadlineInput = document.getElementById('task-deadline') as HTMLInputElement;
  const saveButton = document.getElementById('save-button') as HTMLButtonElement;
  const saveText = document.getElementById('save-text')!;
  const saveSpinner = document.getElementById('save-spinner')!;
  const titleError = document.getElementById('title-error')!;

  // Event listener references for cleanup
  let escKeyListener: ((e: KeyboardEvent) => void) | null = null;
  let titleInputListener: (() => void) | null = null;
  let closeButtonListener: (() => void) | null = null;
  let cancelButtonListener: (() => void) | null = null;
  let overlayClickListener: ((e: Event) => void) | null = null;
  let formSubmitListener: ((e: Event) => void) | null = null;

  // Close modal function with proper cleanup
  const closeModal = () => {
    // Remove all event listeners
    if (escKeyListener) {
      document.removeEventListener('keydown', escKeyListener);
    }
    if (titleInputListener) {
      titleInput.removeEventListener('input', titleInputListener);
    }
    if (closeButtonListener) {
      document.getElementById('close-modal')?.removeEventListener('click', closeButtonListener);
    }
    if (cancelButtonListener) {
      document.getElementById('cancel-button')?.removeEventListener('click', cancelButtonListener);
    }
    if (overlayClickListener) {
      modal.removeEventListener('click', overlayClickListener);
    }
    if (formSubmitListener) {
      form.removeEventListener('submit', formSubmitListener);
    }
    
    // Remove modal from DOM
    modal.remove();
  };

  // Comprehensive form validation
  const validateForm = (): boolean => {
    let isValid = true;
    
    // Title validation
    if (!titleInput.value.trim()) {
      titleError.textContent = 'Görev başlığı gereklidir';
      titleError.classList.remove('hidden');
      titleInput.classList.add('border-red-500');
      isValid = false;
    } else if (titleInput.value.trim().length > 200) {
      titleError.textContent = 'Başlık en fazla 200 karakter olabilir';
      titleError.classList.remove('hidden');
      titleInput.classList.add('border-red-500');
      isValid = false;
    } else {
      titleError.classList.add('hidden');
      titleInput.classList.remove('border-red-500');
    }

    // Date validation
    const deadlineValue = deadlineInput.value;
    if (deadlineValue) {
      const selectedDate = new Date(deadlineValue);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        // Could add date error display here if needed
        logger.warn('Selected date is in the past', { selectedDate });
      }
    }

    return isValid;
  };

  // Setup event listeners with references
  titleInputListener = () => {
    if (titleInput.value.trim()) {
      titleError.classList.add('hidden');
      titleInput.classList.remove('border-red-500');
    }
  };
  titleInput.addEventListener('input', titleInputListener);

  closeButtonListener = closeModal;
  document.getElementById('close-modal')?.addEventListener('click', closeButtonListener);
  
  cancelButtonListener = closeModal;
  document.getElementById('cancel-button')?.addEventListener('click', cancelButtonListener);
  
  // Click outside to close
  overlayClickListener = (e: Event) => {
    if (e.target === modal) {
      closeModal();
    }
  };
  modal.addEventListener('click', overlayClickListener);

  // ESC to close
  escKeyListener = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };
  document.addEventListener('keydown', escKeyListener);

  // Form submit with proper reference for cleanup
  formSubmitListener = async (e: Event) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Show loading state
    saveButton.disabled = true;
    saveText.textContent = 'Kaydediliyor...';
    saveSpinner.classList.remove('hidden');

    try {
      // Prepare update data
      const updateData: UpdateTaskData = {
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim(),
        status: statusSelect.value as TaskStatus,
        type: typeSelect.value as TaskType,
        priority: prioritySelect.value as TaskPriority,
        assignedPerson: assignedInput.value.trim(),
        deadline: new Date(deadlineInput.value)
      };

      // Update task in Firebase
      await updateTask(task.id, updateData);

      // Success
      closeModal();
      onSuccess?.();
      alert('Görev başarıyla güncellendi');

    } catch (error) {
      logger.error('Task update error in modal', { taskId: task.id, error });
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      onError?.(errorMessage);
      alert(`Görev güncellenirken hata oluştu: ${errorMessage}`);
    } finally {
      // Reset loading state
      saveButton.disabled = false;
      saveText.textContent = 'Kaydet';
      saveSpinner.classList.add('hidden');
    }
  };
  form.addEventListener('submit', formSubmitListener);

  // Focus first input
  titleInput.focus();
  titleInput.select();

  return {
    modal,
    closeModal
  };
}