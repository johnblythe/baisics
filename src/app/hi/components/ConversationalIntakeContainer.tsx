"use client";

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { getUser, getUserProgram, getSessionIntake } from "../../start/actions";
import { User } from "@prisma/client";
import { ConversationalInterface } from "./ConversationalInterface";
import Link from "next/link";
import { Program, IntakeFormData } from "@/types";

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

// Convert DB intake format to extractedData format for ConversationalInterface
function intakeToExtractedData(intake: any): IntakeFormData | null {
  if (!intake) return null;

  return {
    gender: intake.sex === 'man' ? 'male' : intake.sex === 'woman' ? 'female' : intake.sex,
    goals: intake.trainingGoal,
    daysPerWeek: intake.daysAvailable,
    timePerDay: intake.dailyBudget,
    age: intake.age,
    weight: intake.weight,
    height: intake.height,
    experienceLevel: intake.experienceLevel || 'beginner',
    workoutEnvironment: {
      primary: 'gym',
      limitations: []
    },
    equipmentAccess: {
      type: 'full-gym',
      available: intake.trainingPreferences || []
    },
    workoutStyle: {
      primary: 'strength',
      secondary: null
    },
    preferences: intake.trainingPreferences || [],
    additionalInfo: typeof intake.additionalInfo === 'string' ? intake.additionalInfo : ''
  };
}

function ConversationalIntakeContent({ chatRef, userId: propUserId, preventNavigation }: ConversationalIntakeContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const [userId, setUserId] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [existingIntake, setExistingIntake] = useState<IntakeFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from URL params or authenticated session
  useEffect(() => {
    // Wait for session to finish loading before initializing
    if (sessionStatus === "loading") return;

    const initialize = async () => {
      const urlUserId = searchParams.get("userId");
      let activeUserId = propUserId || urlUserId || session?.user?.id;

      if (activeUserId) {
        setUserId(activeUserId);

        // Fetch user data
        const result = await getUser(activeUserId);
        if (result.success && result.user) {
          setUser(result.user);

          // Fetch existing intake for returning users (#107)
          const intakeResult = await getSessionIntake(activeUserId);
          if (intakeResult.success && intakeResult.intake) {
            const extractedData = intakeToExtractedData(intakeResult.intake);
            setExistingIntake(extractedData);
          }

          // Check for program in URL
          const urlProgramId = searchParams.get("programId");
          if (urlProgramId) {
            const programResult = await getUserProgram(activeUserId, urlProgramId);
            if (programResult.success && programResult.program) {
              setProgram(programResult.program as unknown as Program);
            }
          }
        }
      }
      setIsLoading(false);
    };

    initialize();
  }, [searchParams, propUserId, session?.user?.id, sessionStatus]);

  const handleProgramChange = (newProgram: Program | null) => {
    setProgram(newProgram);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-[#F1F5F9] border-t-[#FF6B6B] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <ConversationalInterface
        userId={userId}
        user={user}
        initialProgram={program}
        initialExtractedData={existingIntake}
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