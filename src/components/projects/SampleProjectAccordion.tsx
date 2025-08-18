'use client';

import { useState } from 'react';
import { Project, Task } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

// Sample Projects Data
const SAMPLE_PROJECTS: Project[] = [
  {
    id: 'project-1',
    name: 'E-Ticaret Platformu',
    createdAt: Timestamp.now(),
    order: 0
  },
  {
    id: 'project-2', 
    name: 'Mobil Uygulama Geliştirme',
    createdAt: Timestamp.now(),
    order: 1
  },
  {
    id: 'project-3',
    name: 'Kurumsal Website',
    createdAt: Timestamp.now(),
    order: 2
  }
];

// Sample Tasks Data
const SAMPLE_TASKS: Task[] = [
  // E-Ticaret Platformu tasks
  {
    id: 'task-1',
    projectId: 'project-1',
    title: 'Ödeme sistemi entegrasyonu',
    description: 'PayU ve iyzico entegrasyonu',
    status: 'Yapılıyor',
    assignedPerson: "",
    type: "Operasyon",
    priority: 'Yüksek',
    deadline: new Date(2025, 0, 15),
    createdAt: Timestamp.now()
  },
  {
    id: 'task-2',
    projectId: 'project-1',
    title: 'Ürün kataloğu API',
    description: 'REST API geliştirme',
    status: 'Yapıldı',
    assignedPerson: "",
    type: "Operasyon",
    priority: 'Orta',
    deadline: new Date(2025, 0, 10),
    createdAt: Timestamp.now()
  },
  {
    id: 'task-3',
    projectId: 'project-1',
    title: 'Kullanıcı yönetimi',
    description: 'Kayıt ve giriş sistemi',
    status: 'Beklemede',
    assignedPerson: "",
    type: "Operasyon",
    priority: 'Orta',
    deadline: new Date(2025, 0, 20),
    createdAt: Timestamp.now()
  },
  // Mobil Uygulama tasks
  {
    id: 'task-4',
    projectId: 'project-2',
    title: 'React Native kurulumu',
    description: 'Proje altyapısı hazırlığı',
    status: 'Yapıldı',
    assignedPerson: "",
    type: "Operasyon",
    priority: 'Yüksek',
    deadline: new Date(2025, 0, 8),
    createdAt: Timestamp.now()
  },
  {
    id: 'task-5',
    projectId: 'project-2',
    title: 'Push notification servisi',
    description: 'Firebase FCM entegrasyonu',
    status: 'Blocked',
    assignedPerson: "",
    type: "Operasyon",
    priority: 'Orta',
    deadline: new Date(2025, 0, 25),
    createdAt: Timestamp.now()
  }
  // project-3 has no tasks (empty state test)
];

// Task row component
function TaskRow({ task }: { task: Task }) {
  const isOverdue = task.deadline < new Date();
  
  const statusColors = {
    'Yapılacak': 'bg-gray-100 text-gray-800',
    'Yapılıyor': 'bg-blue-100 text-blue-800',
    'Beklemede': 'bg-orange-100 text-orange-800',
    'Blocked': 'bg-red-100 text-red-800',
    'Yapıldı': 'bg-green-100 text-green-800'
  };

  const priorityColors = {
    'Yüksek': 'bg-red-100 text-red-800 border-red-200',
    'Orta': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Düşük': 'bg-green-100 text-green-800 border-green-200'
  };
  
  return (
    <div className="bg-gray-50 border rounded-lg p-3 hover:bg-white transition-colors cursor-pointer">
      <div className="flex items-center justify-between">
        {/* Left side - Title and badges */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <h5 className="font-medium text-gray-900 text-sm truncate flex-1">
            {task.title}
          </h5>
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[task.status]}`}>
            {task.status}
          </span>
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

// Individual project accordion item
function SampleProjectItem({ project }: { project: Project }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const projectTasks = SAMPLE_TASKS.filter(task => task.projectId === project.id);
  
  // Calculate completion stats
  const completedTasks = projectTasks.filter(task => task.status === 'Yapıldı').length;
  const totalTasks = projectTasks.length;
  
  const toggleExpand = () => setIsExpanded(!isExpanded);
  
  return (
    <div className="bg-white border rounded-lg shadow-sm">
      {/* Accordion Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={toggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Expand/Collapse Icon */}
            <button className="text-gray-400 hover:text-gray-600">
              {isExpanded ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
            
            {/* Project Name */}
            <h3 className="font-semibold text-gray-900">{project.name}</h3>
          </div>
          
          {/* Task Counter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {completedTasks}/{totalTasks} tamamlandı
            </span>
            {totalTasks > 0 && (
              <div className="flex">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  completedTasks === totalTasks 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {Math.round((completedTasks / totalTasks) * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Accordion Content */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="border-t pt-4">
            {/* Add Task Button */}
            <div className="mb-4">
              <button 
                className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`Yeni görev eklenecek: ${project.name}`);
                }}
              >
                + Yeni Görev Ekle
              </button>
            </div>
            
            {/* Tasks List */}
            <div className="space-y-2">
              {projectTasks.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <div className="text-2xl mb-2">📋</div>
                  <p className="text-sm">Bu projede henüz görev yok</p>
                  <p className="text-xs text-gray-400 mt-1">Yukarıdaki butonu kullanarak yeni görev ekleyebilirsiniz</p>
                </div>
              ) : (
                projectTasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sample Project Accordion component
export default function SampleProjectAccordion() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Projeler <span className="text-sm text-blue-600">(Örnek Veri)</span>
        </h2>
        <span className="text-sm text-gray-500">
          {SAMPLE_PROJECTS.length} proje
        </span>
      </div>
      
      {/* Projects List */}
      <div className="space-y-4">
        {SAMPLE_PROJECTS.map((project) => (
          <SampleProjectItem key={project.id} project={project} />
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