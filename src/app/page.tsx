export default function Home() {
  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Development Progress</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Task 1.1 - Next.js Projesi Kurulumu ✅ TAMAMLANDI</li>
          <li>Task 1.2 - Firebase Konfigürasyonu ✅ TAMAMLANDI</li>
          <li>Task 1.3 - Proje Klasör Yapısı ✅ TAMAMLANDI</li>
          <li>Task 2.1 - TypeScript Data Modelleri ✅ TAMAMLANDI</li>
          <li>Task 2.2 - Firebase CRUD Operasyonları ✅ TAMAMLANDI</li>
          <li>Task 2.3 - Real-time Data Hooks ✅ TAMAMLANDI</li>
          <li>Task 3.1 - Ana Layout ✅ TAMAMLANDI</li>
        </ul>
      </div>
      
      {/* Test content for responsive design */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Responsive Test</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded">
            <h4 className="font-medium">Mobile (sm)</h4>
            <p className="text-sm text-gray-600">Single column</p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <h4 className="font-medium">Tablet (md)</h4>
            <p className="text-sm text-gray-600">Two columns</p>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <h4 className="font-medium">Desktop (lg)</h4>
            <p className="text-sm text-gray-600">Three columns</p>
          </div>
        </div>
      </div>
    </>
  );
}