"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import {
  uploadImages,
  getSessionImages,
  deleteImage,
  saveIntakeForm,
  getSessionIntake,
  IntakeFormData,
  Sex,
  TrainingGoal,
  TrainingPreference,
  getSessionWorkoutPlans,
  getSessionPromptLogs,
  createNewProgram,
  preparePromptForAI,
} from "./actions";
import { useSearchParams, useRouter } from "next/navigation";
import { WorkoutPlanDisplay } from "@/app/components/WorkoutPlanDisplay";
import { fileToBase64 } from "@/utils/fileHandling";
import { IntakeForm } from "@/app/components/IntakeForm";
import { UserProfileDisplay } from "@/app/components/UserProfileDisplay";
import { ProgramData, WorkoutPlan, WorkoutPlanData } from "./types";
import { Program as PrismaProgram, WorkoutPlan as PrismaWorkoutPlan } from "@prisma/client";
import { formatUnderscoreDelimitedString } from "@/utils/formatting";
import { ProgramDisplay } from "../components/ProgramDisplay";

// Add new types
type ContextRequest = {
  key: string; 
  reason?: string;
  importance?: string;
};

type UploadedImage = {
  id: string;
  sessionId: string;
  fileName: string;
  base64Data: string;
  createdAt: Date;
  aiDescription?: string;
};

export default function StartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [files, setFiles] = useState<File[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [intakeForm, setIntakeForm] = useState<IntakeFormData | null>(null);
  const [showIntakeForm, setShowIntakeForm] = useState(!intakeForm);
  const [workoutPlan, setWorkoutPlans] = useState<PrismaWorkoutPlan | null>(null);
  const [program, setProgram] = useState<PrismaProgram | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contextRequest, setContextRequest] = useState<ContextRequest[] | null>(null);

  // Add useEffect to handle session initialization and image loading
  useEffect(() => {
    const urlSessionId = searchParams.get("sessionId");
    if (urlSessionId) {
      setSessionId(urlSessionId);
      loadSessionImages(urlSessionId);
      loadIntakeForm(urlSessionId);
      loadProgram(urlSessionId);
    } else {
      setSessionId(uuidv4());
      setIsLoading(false);
    }
  }, [searchParams]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setFiles((prev) => {
      const newFiles = [...prev, ...acceptedFiles];
      // Limit to 10 files
      return newFiles.slice(0, 10);
    });
  }, []);

  // Add the dropzone setup
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxSize: 5242880, // 5MB
  });

  const loadSessionImages = async (sid: string) => {
    // Skip loading for new sessions (when sid is not in URL)
    if (!searchParams.get("sessionId")) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await getSessionImages(sid);
      if (result.success) {
        setUploadedImages(result.images);
      } else {
        console.error("Failed to load session images:", result.error);
      }
    } catch (error) {
      console.error("Failed to load session images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new function to load intake form
  const loadIntakeForm = async (sid: string) => {
    const result = await getSessionIntake(sid);
    if (result.success && result.intake) {
      setIntakeForm({
        sex: result.intake.sex as Sex,
        trainingGoal: result.intake.trainingGoal as TrainingGoal,
        daysAvailable: result.intake.daysAvailable,
        trainingPreferences: result.intake
          .trainingPreferences as TrainingPreference[],
        additionalInfo: result.intake.additionalInfo || "",
        age: result.intake.age || undefined,
        height: result.intake.height || undefined,
        weight: result.intake.weight || undefined,
        experienceLevel: result.intake.experienceLevel || undefined,
      });
      setShowIntakeForm(false);
    }
  };

  // Modify loadWorkoutPlan to handle parsing from prompt logs if needed
  const loadProgram = async (sid: string) => {
    const result = await getSessionWorkoutPlans(sid);
    console.log("🚀 ~ loadProgram ~ result:", result)
    const program = result.success ? result.program : null;
    const workoutPlans = program?.workoutPlans || [];
    setProgram(program);
    setWorkoutPlans(workoutPlans);
    setShowIntakeForm(false);

    // TODO: get more context from prompts to make customizations
    const sessionPromptLog = await getSessionPromptLogs(sid);
    const contextRequest = sessionPromptLog.success && sessionPromptLog.log? JSON.parse(sessionPromptLog.log.response).contextRequest : null;
    if (contextRequest) {
      setContextRequest(contextRequest);
    }
    // end TODO
  };

  const handleIntakeSubmit = async (
    formData: IntakeFormData & { files?: File[] }
  ) => {
    setIsUploading(true);
    router.push(`${window.location.pathname}?sessionId=${sessionId}`);
    try {
      // Extract files from form data
      // const { files: uploadedFiles, ...intakeData } = formData;

      // Save intake form
      const intakeResult = await saveIntakeForm(sessionId, formData);
      if (!intakeResult.success) {
        throw new Error("Failed to save intake form");
      }

      // now that we've saved it, shoot it off to the AI
      const promptResult = await preparePromptForAI(
        sessionId,
        formData,
        intakeResult.images || []
      );

      // NOTE: START HERE TODO LIST
      // need to get submission to:
      // 1. reintegrate images
      // 2. allow updates after first turn, including images
      // 3. add teaser
      // 4. add lead magnet

      if (!promptResult.success) {
        throw new Error("Failed to prepare prompt for AI");
      }

      const responseText = promptResult.response;
      const parsedResponse = JSON.parse(responseText);
      console.log("🚀 ~ StartPage ~ parsedResponse:", parsedResponse)
      const { program, contextRequest } = parsedResponse;

      if (contextRequest) {
        setContextRequest(contextRequest);
      }

      // now save it
      const workoutPlanResult = await createNewProgram(program, sessionId);

      if (workoutPlanResult.success) {
        setWorkoutPlans(workoutPlanResult.workoutPlan);
      }

      // Handle file uploads if there are any
      // if (uploadedImages && uploadedImages.length > 0) {
      //   const base64Files = await Promise.all(
      //     uploadedImages.map(async (image) => ({
      //       fileName: file.name,
      //       base64Data: await fileToBase64(file),
      //       sessionId,
      //     }))
      //   );

      //   const uploadResult = await uploadImages(base64Files);
      //   if (uploadResult.success) {
      //     setUploadedImages((prev) => [...prev, ...uploadResult.images]);
      //   } else {
      //     throw new Error("Failed to upload images");
      //   }
      // }

      // Update UI state
      // if (intakeResult.intake) {
      //   setIntakeForm({
      //     sex: intakeResult.intake.sex as Sex,
      //     trainingGoal: intakeResult.intake.trainingGoal as TrainingGoal,
      //     daysAvailable: intakeResult.intake.daysAvailable,
      //     trainingPreferences: intakeResult.intake
      //       .trainingPreferences as TrainingPreference[],
      //     additionalInfo: intakeResult.intake.additionalInfo || "",
      //   });
      // }
      // setShowIntakeForm(false);
      // setFiles([]); // Clear files after successful upload

      // Update URL if needed
      if (!searchParams.get("sessionId")) {
        router.push(`${window.location.pathname}?sessionId=${sessionId}`);
      }
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Add delete handler
  const handleDelete = async (imageId: string) => {
    const result = await deleteImage(imageId);
    if (result.success) {
      setUploadedImages((prev) => prev.filter((image) => image.id !== imageId));
    } else {
      console.error("Failed to delete image");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {contextRequest && (
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Help us personalize your plan further!
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>We&apos;re missing some key information that could help improve your results:</p>
                <ul className="list-disc ml-5 mt-2">
                  {Object.entries(contextRequest).map(([idx, value]) => (
                    <li key={idx} className="mb-2">
                      <span className="font-semibold capitalize">{formatUnderscoreDelimitedString(value.key)}</span>
                      {value.reason && <span>: {value.reason}</span>}
                      {value.importance && (
                        <span className="inline-block text-xs px-2 py-1 mt-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-medium">
                          {value.importance}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setShowIntakeForm(true)}
                className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Update Profile →
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showIntakeForm ? (
        <IntakeForm
          initialData={intakeForm}
          isSubmitting={isSubmitting}
          onSubmit={async (data) => {
            setIsSubmitting(true);
            try {
              await handleIntakeSubmit(data);
              setShowIntakeForm(false);
            } finally {
              setIsSubmitting(false);
            }
          }}
        />
      ) : (
        <>
          {intakeForm && (
            <UserProfileDisplay
              intakeForm={intakeForm}
              images={uploadedImages}
              onDeleteImage={handleDelete}
              onEditProfile={() => setShowIntakeForm(true)}
            />
          )}
          {program && <ProgramDisplay 
            program={program} />}
        </>
      )}
    </div>
  );
}
