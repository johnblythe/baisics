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
  getUserProgram,
  getSessionPromptLogs,
  createNewProgram,
  preparePromptForAI,
  createAnonUser,
  getUser,
} from "./actions";
import { useSearchParams, useRouter } from "next/navigation";
import { fileToBase64 } from "@/utils/fileHandling";
import { IntakeForm } from "@/app/components/IntakeForm";
import { UserProfileDisplay } from "@/app/components/UserProfileDisplay";
import { Program as PrismaProgram, WorkoutPlan as PrismaWorkoutPlan, User } from "@prisma/client";
import { formatUnderscoreDelimitedString } from "@/utils/formatting";
import { ProgramDisplay } from "../components/ProgramDisplay";
import { UpsellModal } from "@/app/components/UpsellModal";
import { Skeleton } from "@/app/components/ui/skeleton";

// Add new types
type ContextRequest = {
  key: string; 
  reason?: string;
  importance?: string;
};

type UploadedImage = {
  id: string;
  userId: string;
  fileName: string;
  base64Data: string;
  createdAt: Date;
  aiDescription?: string;
};

export default function StartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [files, setFiles] = useState<File[]>([]);
  const [userId, setUserId] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [intakeForm, setIntakeForm] = useState<IntakeFormData | null>(null);
  const [showIntakeForm, setShowIntakeForm] = useState(!intakeForm);
  const [workoutPlans, setWorkoutPlans] = useState<PrismaWorkoutPlan[] | null>(null);
  const [program, setProgram] = useState<PrismaProgram | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contextRequest, setContextRequest] = useState<ContextRequest[] | null>(null);
  const [programId, setProgramId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const [isProgramGenerating, setIsProgramGenerating] = useState(false);

  useEffect(() => {
    const urlProgramId = searchParams.get("programId");
    if (urlProgramId) {
      setProgramId(urlProgramId);
    }
    const urlUserId = searchParams.get("userId");
    if (urlUserId) {
      setUserId(urlUserId);
      loadUser(urlUserId);
    }
      // loadIntakeForm(urlUserId);
      // loadUserImages(urlUserId);
    if (urlUserId && urlProgramId) {
      loadProgram(urlUserId, urlProgramId);
    } else if (urlUserId) {
      loadIntakeForm(urlUserId);
    }
  }, []);

  const loadUser = async (userId: string) => {
    const result = await getUser(userId);
    if (result.success && result.user) {
      setUser(result.user);
      console.log("🚀 ~ loadUser ~ result.user:", result.user)
      setUserId(result.user.id);
    }
  }

  // add useEffect to handle session initialization and image loading
  useEffect(() => {
    const urlUserId = searchParams.get("userId");
    if (urlUserId) {
      setUserId(urlUserId);
      loadUserImages(urlUserId);
      loadIntakeForm(urlUserId);
    }
  }, [searchParams]);

  const loadUserImages = async (uid: string) => {
    // Skip loading for new sessions (when uid is not in URL)
    if (!searchParams.get("userId")) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await getSessionImages(uid);
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
  const loadIntakeForm = async (uid: string) => {
    const result = await getSessionIntake(uid);
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
  const loadProgram = async (uid: string, programId: string) => {
    const result = await getUserProgram(uid, programId);
    const program = result.success ? result.program : null;
    if (!program) {
      console.error("Failed to load program:", result.error);
      return;
    }
    const workoutPlans = program?.workoutPlans || [];
    setProgram(program);
    setWorkoutPlans(workoutPlans);
    setShowIntakeForm(false);

    // TODO: get more context from prompts to make customizations
    // const sessionPromptLog = await getSessionPromptLogs(uid);
    // const contextRequest = sessionPromptLog.success && sessionPromptLog.log? JSON.parse(sessionPromptLog.log.response).contextRequest : null;
    // if (contextRequest) {
    //   setContextRequest(contextRequest);
    // }
    // end TODO
  };

  // Modify handleIntakeSubmit to split the flow
  const handleIntakeSubmit = async (
    formData: IntakeFormData & { files?: File[] }
  ) => {
    setIsSubmitting(true);
    try {
      // First phase: Create user and save intake
      const newUserId = uuidv4();
      const anonUser = await createAnonUser(newUserId);
      if (!anonUser.success || !anonUser.user) {
        throw new Error("Failed to create new anonymous user");
      }

      setUserId(anonUser.user.id);
      setUser(anonUser.user);
      router.push(`${window.location.pathname}?userId=${anonUser.user.id}`);

      // Handle file uploads if present
      if (formData.files && formData.files.length > 0) {
        const imagesToUpload = await Promise.all(formData.files.map(async (file) => ({
          fileName: file.name,
          base64Data: await fileToBase64(file),
          userId: anonUser.user.id,
        })));

        const uploadResult = await uploadImages(imagesToUpload);
        if (uploadResult.success && uploadResult.images) {
          setUploadedImages(uploadResult.images);
        }
      }

      // Remove files from formData before saving intake
      // @TODO: idk if i want this
      const { files, ...intakeData } = formData;
      const intakeResult = await saveIntakeForm(newUserId, intakeData);
      if (!intakeResult.success) {
        throw new Error("Failed to save intake form");
      }

      setIntakeForm(formData);
      setShowIntakeForm(false);
      setIsSubmitting(false);

      setIsProgramGenerating(true);
      const promptResult = await preparePromptForAI(newUserId, formData);
      
      if (!promptResult.success) {
        throw new Error("Failed to prepare prompt for AI");
      }

      const programData = JSON.parse(promptResult.response);
      const result = await createNewProgram(programData, newUserId);

      if (result.success) {
        const program = result.program;
        setProgram(program);
        setWorkoutPlans(program?.workoutPlans || []);
        setProgramId(program?.id);
        router.push(`${window.location.pathname}?userId=${newUserId}&programId=${program?.id}`);
      }
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsProgramGenerating(false);
      setIsSubmitting(false);
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

  const handleOpenUpsellModal = () => {
    setIsUpsellOpen(true);
  };

  const handleCloseUpsellModal = () => {
    setIsUpsellOpen(false);
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
          onSubmit={handleIntakeSubmit}
        />
      ) : (
        <>
          {intakeForm && (
            <UserProfileDisplay
              intakeForm={intakeForm}
              images={uploadedImages}
              user={user}
              onDeleteImage={handleDelete}
              onEditProfile={() => setShowIntakeForm(true)}
              onRequestUpsell={handleOpenUpsellModal}
              onUploadImages={async (files) => {
                setIsUploading(true);
                try {
                  const base64Files = await Promise.all(files.map(fileToBase64));
                  console.log("🚀 ~ onUploadImages={ ~ base64Files:", base64Files)
                  const result = await uploadImages(userId, base64Files);
                  console.log("🚀 ~ onUploadImages={ ~ result:", result)
                  if (result.success) {
                    setUploadedImages(prev => [...prev, ...result.images]);
                  }
                } catch (error) {
                  console.error('Failed to upload images:', error);
                } finally {
                  setIsUploading(false);
                }
              }}
            />
          )}

          {isProgramGenerating ? (
            <div className="mt-8 space-y-6">
              <h2 className="text-2xl font-bold">Generating Your Program...</h2>
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          ) : (
            program && (
              <ProgramDisplay 
                program={program}
                userEmail={user?.email}
                onRequestUpsell={handleOpenUpsellModal}
              />
            )
          )}
        </>
      )}

      <UpsellModal
        isOpen={isUpsellOpen}
        onClose={handleCloseUpsellModal}
        onEmailSubmit={(email) => {
          // Handle email submission logic
          handleCloseUpsellModal();
        }}
        onPurchase={() => {
          // Handle purchase logic
          handleCloseUpsellModal();
        }}
        userEmail={user?.email}
      />

      {/* Admin Testing Corner */}
      <div className="fixed bottom-4 right-4 opacity-50 hover:opacity-100 transition-opacity">
        <a
          href="/start"
          className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          New Session
        </a>
      </div>
    </div>
  );
}
