'use client';

import { useState } from 'react';
import Modal from './Modal';

// Sample form content for testing
function SampleTaskForm() {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Görev Başlığı
        </label>
        <input
          type="text"
          defaultValue="E-ticaret API entegrasyonu"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Açıklama
        </label>
        <textarea
          rows={3}
          defaultValue="PayU ve iyzico ödeme sistemleri entegrasyonu"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Öncelik
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="Yüksek">Yüksek</option>
            <option value="Orta">Orta</option>
            <option value="Düşük">Düşük</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Durum
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="Yapılacak">Yapılacak</option>
            <option value="Yapılıyor">Yapılıyor</option>
            <option value="Beklemede">Beklemede</option>
            <option value="Blocked">Blocked</option>
            <option value="Yapıldı">Yapıldı</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Atanan Kişi
        </label>
        <input
          type="text"
          defaultValue="Zeynep Kaya"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Deadline
        </label>
        <input
          type="date"
          defaultValue="2025-01-15"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {/* Modal Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button 
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          İptal
        </button>
        <button 
          type="button"
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
        >
          Sil
        </button>
        <button 
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Kaydet
        </button>
      </div>
    </div>
  );
}

// Modal test component
export default function ModalTest() {
  const [isSmallModalOpen, setIsSmallModalOpen] = useState(false);
  const [isMediumModalOpen, setIsMediumModalOpen] = useState(false);
  const [isNoTitleModalOpen, setIsNoTitleModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Modal Component Test <span className="text-sm text-blue-600">(Test Amaçlı)</span>
        </h2>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setIsSmallModalOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Small Modal (Simple)
        </button>
        
        <button
          onClick={() => setIsMediumModalOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
        >
          Medium Modal (Task Form)
        </button>
        
        <button
          onClick={() => setIsNoTitleModalOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
        >
          No Title Modal
        </button>
      </div>

      {/* Feature List */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Modal Özellikleri:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>✅ ESC tuşu ile kapanma</li>
          <li>✅ Overlay click ile kapanma</li>
          <li>✅ X butonu ile kapanma</li>
          <li>✅ Body scroll lock</li>
          <li>✅ Focus trap (Tab navigation)</li>
          <li>✅ Portal rendering (document.body)</li>
          <li>✅ Responsive tasarım</li>
          <li>✅ Smooth animations</li>
          <li>✅ ARIA attributes</li>
        </ul>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isSmallModalOpen}
        onClose={() => setIsSmallModalOpen(false)}
        title="Small Modal Test"
        size="sm"
      >
        <p className="text-gray-600">
          Bu küçük bir modal örnektir. ESC tuşu, overlay click veya X butonuyla kapatabilirsiniz.
        </p>
        <div className="mt-4 flex justify-end">
          <button 
            onClick={() => setIsSmallModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Tamam
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isMediumModalOpen}
        onClose={() => setIsMediumModalOpen(false)}
        title="Görev Düzenle"
        size="md"
      >
        <SampleTaskForm />
      </Modal>


      <Modal
        isOpen={isNoTitleModalOpen}
        onClose={() => setIsNoTitleModalOpen(false)}
        size="md"
      >
        <div className="text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Başlıksız Modal
          </h3>
          <p className="text-gray-600 mb-6">
            Bu modal başlıksızdır ve sağ üst köşede X butonu bulunur.
          </p>
          <button 
            onClick={() => setIsNoTitleModalOpen(false)}
            className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            Harika!
          </button>
        </div>
      </Modal>
    </div>
  );
}