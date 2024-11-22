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
  getSessionWorkoutPlan,
  getSessionPromptLogs,
  createWorkoutPlan,
  preparePromptForAI,
} from "./actions";
import { useSearchParams, useRouter } from "next/navigation";
import { WorkoutPlanDisplay } from "@/app/components/WorkoutPlanDisplay";
import { fileToBase64 } from "@/utils/fileHandling";
import { IntakeForm } from "@/app/components/IntakeForm";
import { UserProfileDisplay } from "@/app/components/UserProfileDisplay";
import { WorkoutPlanData } from "./types";

// Add new types
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
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add useEffect to handle session initialization and image loading
  useEffect(() => {
    const urlSessionId = searchParams.get("sessionId");
    if (urlSessionId) {
      setSessionId(urlSessionId);
      loadSessionImages(urlSessionId);
      loadIntakeForm(urlSessionId);
      loadWorkoutPlan(urlSessionId);
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
      });
      setShowIntakeForm(false);
    }
  };

  // Modify loadWorkoutPlan to handle parsing from prompt logs if needed
  const loadWorkoutPlan = async (sid: string) => {
    console.log("🚀 ~ loadWorkoutPlan ~ sid:", sid);
    const result = await getSessionWorkoutPlan(sid);

    if (result.success && result.workoutPlan) {
      setWorkoutPlan(result.workoutPlan);
      setShowIntakeForm(false); // Hide intake form when plan exists
    } else {
      // This is a fallback state ONLY for easier testing, not irl
      const logsResult = await getSessionPromptLogs(sid);
      if (logsResult.success && logsResult.logs && logsResult.logs.length > 0) {
        try {
          const latestLog = logsResult.logs[0];
          const parsedPlan = JSON.parse(latestLog.response).program as WorkoutPlanData;
          console.log("🚀 ~ loadWorkoutPlan ~ parsedPlan:", parsedPlan)
          const saveResult = await createWorkoutPlan(parsedPlan, sessionId);
          if (saveResult) {
            setWorkoutPlan(saveResult);
            setShowIntakeForm(false);
          }
        } catch (error) {
          console.error("Failed to parse workout plan from logs:", error);
        }
      }
    }
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

      console.log("🚀 ~ StartPage ~ promptResult:", promptResult);
      if (!promptResult.success) {
        throw new Error("Failed to prepare prompt for AI");
      }

      const responseText = promptResult.response;
      const parsedResponse = JSON.parse(responseText);

      // @TODO: use contextRequest to update UI and request more information for updates
      const { program, contextRequest } = parsedResponse;

      // now save it
      const workoutPlanResult = await createWorkoutPlan(program, sessionId);

      if (workoutPlanResult.success) {
        setWorkoutPlan(workoutPlanResult.workoutPlan);
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
          {workoutPlan && <WorkoutPlanDisplay plan={workoutPlan} />}
        </>
      )}
    </div>
  );
}
