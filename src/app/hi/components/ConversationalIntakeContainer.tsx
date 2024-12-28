"use client";

import { useState, useEffect, Suspense } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter, useSearchParams } from "next/navigation";
import { createAnonUser, getUser, getUserProgram } from "../../start/actions";
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
  const [isInitialized, setIsInitialized] = useState(false);

  // fist-time initialization from URL
  useEffect(() => {
    if (isInitialized) return;

    const initializeUser = async () => {
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
      } else {
        const newUserId = uuidv4();
        const result = await createAnonUser(newUserId);
        if (result.success && result.user) {
          setUserId(result.user.id);
          setUser(result.user);
          router.replace(`/hi?userId=${result.user.id}`);
        }
      }
      setIsLoading(false);
      setIsInitialized(true);
    };

    initializeUser();
  }, 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  []);

  const handleProgramChange = (newProgram: Program | null) => {
    setProgram(newProgram);
    // if (newProgram?.id && userId) {
    //   // Use replace instead of push to avoid refresh
    //   const newUrl = `/hi?userId=${userId}&programId=${newProgram.id}`;
    //   router.replace(newUrl);
    // }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 relative">
      <ConversationalInterface 
        userId={userId} 
        user={user}
        initialProgram={program}
        onProgramChange={handleProgramChange}
      />
      
      {/* Admin Testing Corner */}
      <div className="fixed bottom-4 right-4 opacity-50 hover:opacity-100 transition-opacity">
        <Link
          href="/hi"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/hi';
          }}
          className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          New Session
        </Link>
      </div>
    </div>
  );
}

export default function ConversationalIntakeContainer() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConversationalIntakeContent />
    </Suspense>
  )
} 