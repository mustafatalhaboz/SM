import { SummaryDashboard } from '@/components/dashboard';
import { ProjectAccordion } from '@/components/projects';

export default function Home() {
  return (
    <div className="space-y-6">
      {/* Summary Dashboard - High priority tasks */}
      <SummaryDashboard />
      
      {/* Project Accordion - Project management */}
      <ProjectAccordion />
    </div>
  );
}