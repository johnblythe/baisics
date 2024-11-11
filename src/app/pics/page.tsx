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
} from "./actions";
import { useSearchParams, useRouter } from "next/navigation";
import { WorkoutPlanDisplay } from "@/app/components/WorkoutPlanDisplay";
import { fileToBase64 } from "@/utils/fileHandling";
import { IntakeForm } from "@/app/components/IntakeForm";
import { UserProfileDisplay } from "@/app/components/UserProfileDisplay";

// Add new types
type UploadedImage = {
  id: string;
  sessionId: string;
  fileName: string;
  base64Data: string;
  createdAt: Date;
  aiDescription?: string;
};

export default function PicsPage() {
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
    const result = await getSessionWorkoutPlan(sid);
    console.log("🚀 ~ loadWorkoutPlan ~ result:", result);

    if (result.success && result.workoutPlan) {
      setWorkoutPlan(result.workoutPlan);
      setShowIntakeForm(false); // Hide intake form when plan exists
    } else {
      // Try to find and parse from prompt logs
      const logsResult = await getSessionPromptLogs(sid);
      if (logsResult.success && logsResult.logs.length > 0) {
        try {
          const latestLog = logsResult.logs[0];
          const parsedPlan = JSON.parse(latestLog.response);
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

  // Modified handleIntakeSubmit to include image uploads and workout plan
  const handleIntakeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const formData = new FormData(e.currentTarget);

      // Validate required fields
      const sex = formData.get("sex");
      const trainingGoal = formData.get("trainingGoal");
      const daysAvailable = formData.get("daysAvailable");
      const trainingPreferences = formData.getAll("trainingPreferences");

      if (
        !sex ||
        !trainingGoal ||
        !daysAvailable ||
        !trainingPreferences.length
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Create intake data with validated fields
      const intakeData: IntakeFormData = {
        sex: sex as Sex,
        trainingGoal: trainingGoal as TrainingGoal,
        daysAvailable: Number(daysAvailable),
        trainingPreferences: trainingPreferences as TrainingPreference[],
        additionalInfo: formData.get("additionalInfo")?.toString() || "", // Provide default empty string
      };

      const intakeResult = await saveIntakeForm(sessionId, intakeData);
      if (!intakeResult.success) {
        throw new Error("Failed to save intake form");
      }

      if (intakeResult.success && intakeResult.workoutPlan) {
        setWorkoutPlan(intakeResult.workoutPlan);
      }

      // Then handle file uploads if there are any
      if (files.length > 0) {
        const base64Files = await Promise.all(
          files.map(async (file) => ({
            fileName: file.name,
            base64Data: await fileToBase64(file),
            sessionId,
          }))
        );

        const uploadResult = await uploadImages(base64Files);
        if (uploadResult.success) {
          setUploadedImages((prev) => [...prev, ...uploadResult.images]);
        } else {
          throw new Error("Failed to upload images");
        }
      }

      // Update UI state
      setIntakeForm(intakeResult.intake);
      setShowIntakeForm(false);
      setFiles([]); // Clear files after successful upload

      // Update URL if needed
      if (!searchParams.get("sessionId")) {
        router.push(`/pics?sessionId=${sessionId}`);
      }
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Add new handler for starting a new session
  const handleNewSession = () => {
    const newSessionId = uuidv4();
    router.push(`/pics?sessionId=${newSessionId}`);
    window.location.reload();
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
          onSubmit={async (data) => {
            await handleIntakeSubmit(data);
            setShowIntakeForm(false);
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
