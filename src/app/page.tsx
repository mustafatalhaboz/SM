'use client';

import { SummaryDashboard } from '@/components/dashboard';
import { ProjectAccordion } from '@/components/projects';
import { VoiceRecorder } from '@/components/voice';

export default function Home() {
  const handleTranscriptConfirmed = (transcript: string) => {
    console.log('Voice transcript confirmed:', transcript);
    // Here you can add logic to process the confirmed transcript
    // For example, you could parse it as a task creation command
  };

  return (
    <div className="space-y-6">
      {/* Summary Dashboard - High priority tasks */}
      <SummaryDashboard />
      
      {/* Project Accordion - Project management */}
      <ProjectAccordion />
      
      {/* Voice Recorder - Fixed position voice input */}
      <VoiceRecorder onTranscriptConfirmed={handleTranscriptConfirmed} />
    </div>
  );
}