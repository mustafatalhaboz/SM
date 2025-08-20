'use client';

import { useState } from 'react';
import { TaskMatchConfirmation, TaskSearchResult } from '@/types/agent';

export interface TaskDisambiguationModalProps {
  isOpen: boolean;
  confirmationData: TaskMatchConfirmation | null;
  onConfirm: (selectedTask: TaskSearchResult) => void;
  onReject: () => void;
  onCreateNew: () => void;
  onCancel: () => void;
}

/**
 * Modal component for task disambiguation when multiple matches are found
 * or when user confirmation is needed for uncertain matches
 */
export function TaskDisambiguationModal({
  isOpen,
  confirmationData,
  onConfirm,
  onReject,
  onCreateNew,
  onCancel
}: TaskDisambiguationModalProps) {
  
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  if (!isOpen || !confirmationData) {
    return null;
  }

  const handleConfirm = () => {
    if (!selectedTaskId) return;
    
    const selectedMatch = confirmationData.possibleMatches.find(
      match => match.task.id === selectedTaskId
    );
    
    if (selectedMatch) {
      onConfirm(selectedMatch);
    }
  };

  const handleSingleConfirm = (match: TaskSearchResult) => {
    onConfirm(match);
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100';
    if (confidence >= 50) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceText = (confidence: number): string => {
    if (confidence >= 90) return 'Yüksek güven';
    if (confidence >= 70) return 'Orta güven';
    if (confidence >= 50) return 'Düşük güven';
    return 'Çok düşük';
  };

  const getActionText = (commandType: string): string => {
    switch (commandType) {
      case 'UPDATE': return 'güncellenecek';
      case 'COMPLETE': return 'tamamlanacak';
      default: return 'işlenecek';
    }
  };

  // Single confirmation scenario (medium confidence match)
  if (confirmationData.needsConfirmation && confirmationData.topMatch) {
    const match = confirmationData.topMatch;
    const reasons = match.matchDetails?.reasons?.join(', ') || 'Benzer görev';
    
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onCancel}
        />
        
        {/* Dialog */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full max-w-md">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Görev Onayı
                </h3>
                <button
                  onClick={onCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Bu görevi {getActionText(confirmationData.commandType)} mi istiyorsunuz?
              </p>
              
              {/* Task card */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 flex-1">
                    &ldquo;{match.task.title}&rdquo;
                  </h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(match.confidence)}`}>
                    {match.confidence}%
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Proje:</span> {match.projectName}</p>
                  <p><span className="font-medium">Durum:</span> {match.task.status}</p>
                  <p><span className="font-medium">Eşleşme nedeni:</span> {reasons}</p>
                  <p><span className="font-medium">Güven seviyesi:</span> {getConfidenceText(match.confidence)}</p>
                </div>
                
                {match.task.description && (
                  <p className="text-sm text-gray-500 mt-2 italic">
                    &ldquo;{match.task.description}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => handleSingleConfirm(match)}
                  className="
                    w-full px-4 py-2 text-sm font-medium text-white 
                    bg-green-600 border border-transparent rounded-md
                    hover:bg-green-700 focus:outline-none focus:ring-2 
                    focus:ring-offset-2 focus:ring-green-500
                    transition-colors
                  "
                >
                  ✅ Evet, bu görev
                </button>
                
                <button
                  onClick={onReject}
                  className="
                    w-full px-4 py-2 text-sm font-medium text-gray-700 
                    bg-white border border-gray-300 rounded-md
                    hover:bg-gray-50 focus:outline-none focus:ring-2 
                    focus:ring-offset-2 focus:ring-blue-500
                    transition-colors
                  "
                >
                  🔍 Hayır, diğer seçenekleri göster
                </button>
                
                {confirmationData.commandType === 'UPDATE' && (
                  <button
                    onClick={onCreateNew}
                    className="
                      w-full px-4 py-2 text-sm font-medium text-blue-700 
                      bg-blue-50 border border-blue-300 rounded-md
                      hover:bg-blue-100 focus:outline-none focus:ring-2 
                      focus:ring-offset-2 focus:ring-blue-500
                      transition-colors
                    "
                  >
                    ➕ Yeni görev oluştur
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multiple matches disambiguation scenario
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full max-w-2xl max-h-[80vh]">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Hangi Görev?
              </h3>
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              &ldquo;{confirmationData.searchTerm}&rdquo; ile birden fazla görev bulundu. Lütfen {getActionText(confirmationData.commandType)} istediğiniz görevi seçin.
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {confirmationData.possibleMatches.map((match, index) => (
                <label
                  key={match.task.id}
                  className={`
                    block border rounded-lg p-4 cursor-pointer transition-colors
                    ${selectedTaskId === match.task.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="selectedTask"
                      value={match.task.id}
                      checked={selectedTaskId === match.task.id}
                      onChange={(e) => setSelectedTaskId(e.target.value)}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {index + 1}. &ldquo;{match.task.title}&rdquo;
                        </h4>
                        <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(match.confidence)}`}>
                          {match.confidence}%
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium">Proje:</span> {match.projectName}</p>
                        <p><span className="font-medium">Durum:</span> {match.task.status}</p>
                        {match.matchDetails?.reasons?.[0] && (
                          <p><span className="font-medium">Neden:</span> {match.matchDetails.reasons[0]}</p>
                        )}
                      </div>
                      
                      {match.task.description && (
                        <p className="text-sm text-gray-500 mt-2 italic">
                          &ldquo;{match.task.description.length > 100 
                            ? match.task.description.substring(0, 100) + '...'
                            : match.task.description}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex flex-col space-y-3">
              <button
                onClick={handleConfirm}
                disabled={!selectedTaskId}
                className="
                  w-full px-4 py-2 text-sm font-medium text-white 
                  bg-green-600 border border-transparent rounded-md
                  hover:bg-green-700 focus:outline-none focus:ring-2 
                  focus:ring-offset-2 focus:ring-green-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              >
                ✅ Seçilen görev ile devam et
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={onCancel}
                  className="
                    flex-1 px-4 py-2 text-sm font-medium text-gray-700 
                    bg-white border border-gray-300 rounded-md
                    hover:bg-gray-50 focus:outline-none focus:ring-2 
                    focus:ring-offset-2 focus:ring-blue-500
                    transition-colors
                  "
                >
                  ❌ İptal
                </button>
                
                {confirmationData.commandType !== 'COMPLETE' && (
                  <button
                    onClick={onCreateNew}
                    className="
                      flex-1 px-4 py-2 text-sm font-medium text-blue-700 
                      bg-blue-50 border border-blue-300 rounded-md
                      hover:bg-blue-100 focus:outline-none focus:ring-2 
                      focus:ring-offset-2 focus:ring-blue-500
                      transition-colors
                    "
                  >
                    ➕ Yeni görev oluştur
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}