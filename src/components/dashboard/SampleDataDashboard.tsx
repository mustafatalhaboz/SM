'use client';

import { Task } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

// Sample data for development/testing
const SAMPLE_TASKS: Task[] = [
  {
    id: 'sample-1',
    projectId: 'project-1',
    title: 'React Native mobil uygulama geliştirme',
    description: 'iOS ve Android için hibrit uygulama',
    status: 'Yapılıyor',
    priority: 'Yüksek',
    deadline: new Date(2025, 0, 15), // 15 Ocak 2025
    createdAt: Timestamp.now()
  },
  {
    id: 'sample-2',
    projectId: 'project-2',
    title: 'E-ticaret API entegrasyonu',
    description: 'PayU ve iyzico ödeme sistemleri',
    status: 'Beklemede',
    priority: 'Yüksek',
    deadline: new Date(2025, 0, 8), // 8 Ocak 2025 (geçmiş)
    createdAt: Timestamp.now()
  },
  {
    id: 'sample-3',
    projectId: 'project-1',
    title: 'Veritabanı optimizasyonu',
    description: 'PostgreSQL query performance',
    status: 'Yapılacak',
    priority: 'Orta',
    deadline: new Date(2025, 0, 20), // 20 Ocak 2025
    createdAt: Timestamp.now()
  },
  {
    id: 'sample-4',
    projectId: 'project-3',
    title: 'UI/UX tasarım revizyonu',
    description: 'Kullanıcı deneyimi iyileştirmeleri',
    status: 'Yapılıyor',
    priority: 'Orta',
    deadline: new Date(2025, 0, 18), // 18 Ocak 2025
    createdAt: Timestamp.now()
  },
  {
    id: 'sample-5',
    projectId: 'project-2',
    title: 'Güvenlik testi ve penetrasyon',
    description: 'OWASP standartları kontrolü',
    status: 'Blocked',
    priority: 'Yüksek',
    deadline: new Date(2025, 0, 12), // 12 Ocak 2025
    createdAt: Timestamp.now()
  }
];

// Priority badge component
function PriorityBadge({ priority }: { priority: Task['priority'] }) {
  const colors = {
    'Yüksek': 'bg-red-100 text-red-800 border-red-200',
    'Orta': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Düşük': 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[priority]}`}>
      {priority}
    </span>
  );
}

// Status badge component
function StatusBadge({ status }: { status: Task['status'] }) {
  const colors = {
    'Yapılacak': 'bg-gray-100 text-gray-800',
    'Yapılıyor': 'bg-blue-100 text-blue-800',
    'Beklemede': 'bg-orange-100 text-orange-800',
    'Blocked': 'bg-red-100 text-red-800',
    'Yapıldı': 'bg-green-100 text-green-800'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${colors[status]}`}>
      {status}
    </span>
  );
}

// Task row component (horizontal layout)
function TaskRow({ task }: { task: Task }) {
  const isOverdue = task.deadline < new Date();
  
  return (
    <div className="bg-white border rounded-lg p-3 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        {/* Left side - Title and badges */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm truncate flex-1">
            {task.title}
          </h4>
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </div>
        
        {/* Right side - deadline */}
        <div className="flex items-center space-x-4 text-xs text-gray-500 ml-4">
          <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-600'} whitespace-nowrap`}>
            {task.deadline.toLocaleDateString('tr-TR', { 
              day: 'numeric', 
              month: 'short' 
            })}
            {isOverdue && ' ⚠️'}
          </span>
        </div>
      </div>
    </div>
  );
}

// Sample Dashboard with mock data
export default function SampleDataDashboard() {
  // Filter and sort like the real useHighPriorityTasks hook would
  const highPriorityTasks = SAMPLE_TASKS
    .filter(task => ['Yüksek', 'Orta'].includes(task.priority) && task.status !== 'Yapıldı')
    .sort((a, b) => {
      const priorityOrder = { 'Yüksek': 3, 'Orta': 2, 'Düşük': 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.deadline.getTime() - b.deadline.getTime();
    });

  const displayTasks = highPriorityTasks.slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Yüksek Öncelikli Görevler <span className="text-sm text-blue-600">(Örnek Veri)</span>
        </h2>
        <span className="text-sm text-gray-500">
          {displayTasks.length} / {highPriorityTasks.length} görev
        </span>
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {displayTasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </div>

      {/* Info message */}
      <div className="text-center">
        <p className="text-xs text-gray-400 bg-blue-50 px-3 py-2 rounded-md inline-block">
          💡 Bu örnek verilerdir. Firebase&apos;e gerçek veri eklendiğinde otomatik güncellenecek.
        </p>
      </div>
    </div>
  );
}