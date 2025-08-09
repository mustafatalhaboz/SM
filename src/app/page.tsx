import { SummaryDashboard } from '@/components/dashboard';

export default function Home() {
  return (
    <>
      {/* Summary Dashboard */}
      <SummaryDashboard />

      {/* Development Progress (temporary) */}
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
          <li>Task 3.2 - Özet Dashboard ✅ TAMAMLANDI</li>
        </ul>
      </div>
    </>
  );
}