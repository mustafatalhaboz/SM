export default function Home() {
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">SuperM - Task Management</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Development Progress</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Task 1.1 - Next.js Projesi Kurulumu ✅ TAMAMLANDI</li>
            <li>Task 1.2 - Firebase Konfigürasyonu ✅ TAMAMLANDI</li>
            <li>Task 1.3 - Proje Klasör Yapısı (Sonraki)</li>
            <li>Task 2.1 - TypeScript Data Modelleri (Planlanan)</li>
            <li>Task 2.2 - Firebase CRUD Operasyonları (Planlanan)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
