"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Program, User } from "@prisma/client";
import { ProgramDisplay } from "@/app/components/ProgramDisplay";
import { getUser } from "@/app/start/actions";
import MainLayout from "@/app/components/layouts/MainLayout";

function ProgramReviewContent() {
  const searchParams = useSearchParams();
  const [program, setProgram] = useState<Program | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);

  // Add escape key handler
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isUpsellOpen) {
        setIsUpsellOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isUpsellOpen]);

  useEffect(() => {
    const fetchData = async () => {
      const userId = searchParams.get("userId");
      const programId = searchParams.get("programId");

      if (!userId || !programId) {
        setError("Missing required parameters");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user
        const userResult = await getUser(userId);
        if (!userResult.success || !userResult.user) {
          throw new Error("Failed to fetch user");
        }
        setUser(userResult.user);

        // Fetch program
        const response = await fetch(`/api/programs/${programId}?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch program");
        }
        const data = await response.json();
        setProgram(data.program);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!program || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Program Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300">The requested program could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProgramDisplay 
        //@ts-ignore
        program={program}
        userEmail={user?.email}
        onRequestUpsell={() => setIsUpsellOpen(!isUpsellOpen)}
        isUpsellOpen={isUpsellOpen}
        onCloseUpsell={() => setIsUpsellOpen(false)}
      />
    </div>
    
  );
}

export default function ProgramReviewPage() {
  return (
    <MainLayout>
      <Suspense fallback={
        <>
          <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
            <div className="w-6 h-6 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
        </>
      }>
        <ProgramReviewContent />
      </Suspense>
    </MainLayout>
  );
} 