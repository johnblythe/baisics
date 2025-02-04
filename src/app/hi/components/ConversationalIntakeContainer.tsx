"use client";

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getUser, getUserProgram } from "../../start/actions";
import { User } from "@prisma/client";
import { ConversationalInterface } from "./ConversationalInterface";
import Link from "next/link";
import { Program } from "@/types";

// Define the ref type
export interface ConversationalIntakeRef {
  prefillAndSubmit: (message: string) => void;
}

interface ConversationalIntakeContainerProps {
  userId?: string;
  preventNavigation?: boolean;
}

const ConversationalIntakeContainer = forwardRef<ConversationalIntakeRef, ConversationalIntakeContainerProps>(
  ({ userId: propUserId, preventNavigation }, ref) => {
    const chatRef = useRef<ConversationalIntakeRef>(null);

    useImperativeHandle(ref, () => ({
      prefillAndSubmit: (message: string) => {
        chatRef.current?.prefillAndSubmit(message);
      }
    }));

    return <ConversationalIntakeContent chatRef={chatRef} userId={propUserId} preventNavigation={preventNavigation} />;
  }
);

ConversationalIntakeContainer.displayName = 'ConversationalIntakeContainer';

interface ConversationalIntakeContentProps {
  chatRef: React.RefObject<ConversationalIntakeRef>;
  userId?: string;
  preventNavigation?: boolean;
}

function ConversationalIntakeContent({ chatRef, userId: propUserId, preventNavigation }: ConversationalIntakeContentProps) {
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
      
      if (propUserId) {
        setUserId(propUserId);
      } else if (urlUserId) {
        setUserId(urlUserId);
        const result = await getUser(urlUserId);
        if (result.success && result.user) {
          setUser(result.user);
          
          const urlProgramId = searchParams.get("programId");
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
  }, [searchParams, propUserId]);

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
        ref={chatRef}
        preventNavigation={preventNavigation}
      />
      
      {/* Admin Testing Corner */}
      {process.env.NODE_ENV === 'development' && !preventNavigation && (
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

export default ConversationalIntakeContainer; 