import { WorkoutFileUpload } from '@/components/WorkoutFileUpload';

export default function WorkoutUploadTest() {
  return (
    <main className="container mx-auto p-4 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">Workout File Upload Test</h1>
        <WorkoutFileUpload />
      </div>
    </main>
  );
} 