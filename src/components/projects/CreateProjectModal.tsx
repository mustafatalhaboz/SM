'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui';
import { createProject } from '@/lib/firebase-operations';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!projectName.trim()) {
      setError('Proje ismi gereklidir');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createProject({ name: projectName.trim() });
      
      // Success: reset form and close modal
      setProjectName('');
      onClose();
      
      console.log('Project created successfully:', projectName);
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Proje oluşturulurken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setProjectName('');
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Yeni Proje Oluştur"
      size="md"
    >
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

        {/* Modal Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button 
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            İptal
          </button>
          <button 
            type="submit"
            disabled={isLoading || !projectName.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
    </Modal>
  );
}