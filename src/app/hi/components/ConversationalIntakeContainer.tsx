"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getUser, getUserProgram } from "../../start/actions";
import { User } from "@prisma/client";
import { ConversationalInterface } from "./ConversationalInterface";
import Link from "next/link";
import { Program } from "@/types";

function ConversationalIntakeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Only handle URL parameters, don't create new users
  useEffect(() => {
    const initializeFromUrl = async () => {
      const urlUserId = searchParams.get("userId");
      const urlProgramId = searchParams.get("programId");
      
      if (urlUserId) {
        setUserId(urlUserId);
        const result = await getUser(urlUserId);
        if (result.success && result.user) {
          setUser(result.user);
          
          // If we have a programId, load the program
          if (urlProgramId) {
            const programResult = await getUserProgram(urlUserId, urlProgramId);
            if (programResult.success && programResult.program) {
              setProgram(programResult.program as unknown as Program);
            }
          }
        }
      }
      setIsLoading(false);
    };

    initializeFromUrl();
  }, [searchParams]);

  const handleProgramChange = (newProgram: Program | null) => {
    setProgram(newProgram);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <ConversationalInterface 
        userId={userId} 
        user={user}
        initialProgram={program}
        onProgramChange={handleProgramChange}
      />
      
      {/* Admin Testing Corner */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 opacity-50 hover:opacity-100 transition-opacity">
          <Link
            href="/hi"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/hi?test=true';
            }}
            className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            New Session
          </Link>
        </div>
      )}
    </>
  );
}

export default function ConversationalIntakeContainer() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <main className="flex-grow bg-white dark:bg-gray-900">
        <ConversationalIntakeContent />
      </main>
    </div>
  );
} 