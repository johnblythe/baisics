"use client";

/**
 * ConversationalIntakeContainer
 *
 * Supported query params:
 * - userId: string - Override the authenticated user ID
 * - programId: string - Load an existing program for editing
 * - persona: string - Pre-fill intake data with a persona (e.g., 'comeback', 'intermediate', 'parent')
 *
 * Note: Some routes pass additional params (template, invite) that are NOT currently implemented.
 * These params are silently ignored. Future work may add support for them.
 */

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { getUser, getUserProgram, getSessionIntake } from "@/lib/actions/user";
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

// Persona pre-fill data (matches landing-v3 personas)
const PERSONA_DATA: Record<string, any> = {
  comeback: {
    gender: 'female',
    goals: 'Get back in shape, build strength after a long break from training',
    daysPerWeek: 4,
    timePerDay: 45,
    age: 34,
    experienceLevel: 'beginner',
    workoutEnvironment: { primary: 'gym', limitations: [] },
    equipmentAccess: { type: 'full-gym', available: [] },
    workoutStyle: { primary: 'strength', secondary: undefined },
    additionalInfo: "Haven't worked out in about 3 years. Have access to a gym at work during lunch breaks. Want to feel strong again, not just lose weight."
  },
  intermediate: {
    gender: 'male',
    goals: 'Build real strength with proper programming after years of inconsistent training',
    daysPerWeek: 5,
    timePerDay: 60,
    age: 28,
    experienceLevel: 'intermediate',
    workoutEnvironment: { primary: 'home', limitations: [] },
    equipmentAccess: { type: 'home-gym', available: ['barbell', 'dumbbells', 'rack'] },
    workoutStyle: { primary: 'strength', secondary: undefined },
    additionalInfo: "Have a garage gym with barbell, rack, and dumbbells. Been lifting for 2 years but feel like I've been spinning my wheels. Ready for a structured program."
  },
  parent: {
    gender: 'female',
    goals: 'Stay fit and maintain sanity with minimal time commitment',
    daysPerWeek: 3,
    timePerDay: 30,
    age: 42,
    experienceLevel: 'intermediate',
    workoutEnvironment: { primary: 'gym', limitations: [] },
    equipmentAccess: { type: 'full-gym', available: [] },
    workoutStyle: { primary: 'strength', secondary: undefined },
    additionalInfo: "Mom of 2, work full time. Have 30 minutes max, 3 days a week. Planet Fitness near work. Just want something efficient that actually works."
  }
};

// Convert DB intake format to extractedData format for ConversationalInterface
function intakeToExtractedData(intake: any): any {
  if (!intake) return null;

  // Parse additionalInfo JSON to get workout environment, equipment, style
  // These were stored as JSON when the intake was originally saved
  let extraData: any = {};
  if (intake.additionalInfo) {
    try {
      extraData = typeof intake.additionalInfo === 'string'
        ? JSON.parse(intake.additionalInfo)
        : intake.additionalInfo;
    } catch (e) {
      console.warn('Failed to parse additionalInfo:', e);
    }
  }

  return {
    gender: intake.sex === 'man' ? 'male' : intake.sex === 'woman' ? 'female' : intake.sex,
    goals: intake.trainingGoal,
    daysPerWeek: intake.daysAvailable,
    timePerDay: intake.dailyBudget || extraData.timePerDay || 60,
    age: intake.age,
    weight: intake.weight,
    height: intake.height,
    experienceLevel: intake.experienceLevel || 'beginner',
    workoutEnvironment: extraData.workoutEnvironment || {
      primary: 'gym',
      limitations: []
    },
    equipmentAccess: extraData.equipmentAccess || {
      type: 'full-gym',
      available: intake.trainingPreferences || []
    },
    workoutStyle: extraData.workoutStyle || {
      primary: 'strength',
      secondary: null
    },
    preferences: intake.trainingPreferences || [],
    additionalInfo: extraData.originalAdditionalInfo || ''
  };
}

function ConversationalIntakeContent({ chatRef, userId: propUserId, preventNavigation }: ConversationalIntakeContentProps) {
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

      // Check for persona pre-fill from landing page (works for both logged in and anonymous users)
      const personaId = searchParams.get("persona");
      if (personaId && PERSONA_DATA[personaId]) {
        setExistingIntake(PERSONA_DATA[personaId]);
      }

      if (activeUserId) {
        setUserId(activeUserId);

        // Fetch user data
        const result = await getUser(activeUserId);
        if (result.success && result.user) {
          setUser(result.user);

          // Only fetch existing intake if no persona was specified
          if (!personaId) {
            const intakeResult = await getSessionIntake(activeUserId);
            if (intakeResult.success && intakeResult.intake) {
              const extractedData = intakeToExtractedData(intakeResult.intake);
              setExistingIntake(extractedData);
            }
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