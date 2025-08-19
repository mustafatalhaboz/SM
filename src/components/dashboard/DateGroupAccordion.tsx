import { useState } from 'react';
import { TaskWithProject } from '@/lib/types';
import { DateGroup } from '@/hooks/useDateGroupedTasks';

// Task row component (same as SummaryDashboard but extracted for reuse)

// Priority badge component
function PriorityBadge({ priority }: { priority: TaskWithProject['priority'] }) {
  const colors = {
    'Yüksek': 'bg-red-100 text-red-800 border-red-200',
    'Orta': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Düşük': 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full border ${colors[priority]}`}>
      {priority}
    </span>
  );
}

// Duration badge component
function DurationBadge({ estimatedDuration }: { estimatedDuration: TaskWithProject['estimatedDuration'] }) {
  return (
    <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">
      {estimatedDuration}
    </span>
  );
}

// Status badge component
function StatusBadge({ status }: { status: TaskWithProject['status'] }) {
  const colors = {
    'Yapılacak': 'bg-gray-100 text-gray-800',
    'Yapılıyor': 'bg-blue-100 text-blue-800',
    'Beklemede': 'bg-orange-100 text-orange-800',
    'Blocked': 'bg-red-100 text-red-800',
    'Yapıldı': 'bg-green-100 text-green-800'
  };

  return (
    <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${colors[status]}`}>
      {status}
    </span>
  );
}

// Task row component
function TaskRow({ task, onCompleteTask, onTaskEdit }: { task: TaskWithProject; onCompleteTask: (taskId: string) => void; onTaskEdit: (task: TaskWithProject) => void }) {
  const isOverdue = task.deadline < new Date();

  const handleCompleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onCompleteTask(task.id);
  };

  const handleTaskClick = () => {
    onTaskEdit(task);
  };
  
  return (
    <div className="grid grid-cols-12 gap-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 px-3 py-3 transition-colors cursor-pointer" onClick={handleTaskClick}>
      {/* Proje - 2 columns */}
      <div className="col-span-2 sm:col-span-2 flex items-center">
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 truncate">
          {task.projectName}
        </span>
      </div>
      
      {/* Görev - 4 columns */}
      <div className="col-span-4 flex items-center min-w-0">
        <h4 className="font-medium text-gray-900 text-sm truncate">
          {task.title}
        </h4>
      </div>
      
      {/* Öncelik - 2 columns */}
      <div className="col-span-2 flex items-center justify-center">
        <PriorityBadge priority={task.priority} />
      </div>
      
      {/* Süre - 1 column */}
      <div className="col-span-1 flex items-center justify-center">
        <DurationBadge estimatedDuration={task.estimatedDuration} />
      </div>
      
      {/* Durum - 1 column */}
      <div className="col-span-1 flex items-center justify-center">
        <StatusBadge status={task.status} />
      </div>
      
      {/* Tarih - 2 columns */}
      <div className="col-span-2 flex items-center justify-center space-x-1">
        <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-gray-600'} whitespace-nowrap`}>
          {task.deadline.toLocaleDateString('tr-TR', { 
            day: 'numeric', 
            month: 'short' 
          })}
          {isOverdue && ' ⚠️'}
        </span>
        
        {/* Complete button */}
        <button
          onClick={handleCompleteClick}
          className="text-green-500 hover:text-green-700 transition-colors p-1 ml-1"
          title="Görevi tamamla"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Table header component
function TaskTableHeader() {
  return (
    <div className="grid grid-cols-12 gap-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 px-3 py-2 rounded-t-lg">
      <div className="col-span-2">Proje</div>
      <div className="col-span-4">Görev</div>
      <div className="col-span-2 text-center">Öncelik</div>
      <div className="col-span-1 text-center">Süre</div>
      <div className="col-span-1 text-center">Durum</div>
      <div className="col-span-2 text-center">Tarih</div>
    </div>
  );
}

// Main DateGroupAccordion component
interface DateGroupAccordionProps {
  group: DateGroup;
  onCompleteTask: (taskId: string) => void;
  onTaskEdit: (task: TaskWithProject) => void;
}

export default function DateGroupAccordion({ group, onCompleteTask, onTaskEdit }: DateGroupAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(group.isDefaultExpanded);

  // Color classes based on group type
  const colorClasses = {
    red: 'border-red-200 bg-red-50',
    orange: 'border-orange-200 bg-orange-50', 
    yellow: 'border-yellow-200 bg-yellow-50',
    green: 'border-green-200 bg-green-50',
    blue: 'border-blue-200 bg-blue-50'
  };

  const headerColorClasses = {
    red: 'text-red-800 bg-red-50',
    orange: 'text-orange-800 bg-orange-50',
    yellow: 'text-yellow-800 bg-yellow-50',
    green: 'text-green-800 bg-green-50', 
    blue: 'text-blue-800 bg-blue-50'
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (group.count === 0) {
    return null; // Don't render empty groups
  }

  return (
    <div className={`border rounded-lg shadow-sm transition-all duration-200 ${colorClasses[group.color as keyof typeof colorClasses] || 'border-gray-200 bg-white'}`}>
      {/* Accordion Header */}
      <div 
        className={`p-4 cursor-pointer hover:opacity-80 transition-opacity ${headerColorClasses[group.color as keyof typeof headerColorClasses] || 'bg-gray-50'}`}
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Date emoji */}
            <span className="text-lg">{group.emoji}</span>
            
            {/* Title and count */}
            <div>
              <h3 className="font-semibold text-gray-900">{group.title}</h3>
              <p className="text-sm text-gray-600">{group.count} görev</p>
            </div>
          </div>
          
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
        </div>
      </div>

      {/* Accordion Content */}
      {isExpanded && (
        <div className="bg-white">
          {/* Table Header */}
          <TaskTableHeader />
          
          {/* Tasks List */}
          <div className="border border-gray-200 border-t-0 rounded-b-lg">
            {group.tasks.map((task) => (
              <TaskRow 
                key={task.id} 
                task={task} 
                onCompleteTask={onCompleteTask}
                onTaskEdit={onTaskEdit}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}