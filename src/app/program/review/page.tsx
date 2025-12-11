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
        <div className="w-6 h-6 border-2 border-[#F1F5F9] border-t-[#FF6B6B] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 bg-white rounded-2xl border-l-4 border-l-[#EF5350] border border-[#E2E8F0] shadow-md">
          <h1 className="text-2xl font-bold text-[#EF5350] mb-4">Error</h1>
          <p className="text-[#475569]">{error}</p>
        </div>
      </div>
    );
  }

  if (!program || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 bg-white rounded-2xl border border-[#E2E8F0] shadow-md">
          <h1 className="text-2xl font-bold text-[#0F172A] mb-4">Program Not Found</h1>
          <p className="text-[#475569]">The requested program could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
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
      <div className="bg-[#F8FAFC] min-h-screen">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-6 h-6 border-2 border-[#F1F5F9] border-t-[#FF6B6B] rounded-full animate-spin"></div>
          </div>
        }>
          <ProgramReviewContent />
        </Suspense>
      </div>
    </MainLayout>
  );
} 