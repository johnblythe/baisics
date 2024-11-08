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
} from "./actions";
import { useSearchParams, useRouter } from "next/navigation";

// Add new types
type UploadedImage = {
  id: string;
  sessionId: string;
  fileName: string;
  base64Data: string;
  createdAt: Date;
  aiDescription?: string;
};

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [files, setFiles] = useState<File[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [intakeForm, setIntakeForm] = useState<IntakeFormData | null>(null);
  const [showIntakeForm, setShowIntakeForm] = useState(true);

  // Add useEffect to handle session initialization and image loading
  useEffect(() => {
    const urlSessionId = searchParams.get("sessionId");
    if (urlSessionId) {
      setSessionId(urlSessionId);
      loadSessionImages(urlSessionId);
      loadIntakeForm(urlSessionId);
    } else {
      setSessionId(uuidv4());
      setIsLoading(false);
    }
  }, [searchParams]);

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

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
      setIntakeForm(result.intake);
      setShowIntakeForm(false);
    }
  };

  // Modified handleIntakeSubmit to include image uploads
  const handleIntakeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const formData = new FormData(e.currentTarget);

      // First save the intake form
      const intakeData: IntakeFormData = {
        sex: formData.get("sex") as Sex,
        trainingGoal: formData.get("trainingGoal") as TrainingGoal,
        daysAvailable: Number(formData.get("daysAvailable")),
        trainingPreferences: formData.getAll(
          "trainingPreferences"
        ) as TrainingPreference[],
        additionalInfo: formData.get("additionalInfo")?.toString(),
      };

      const intakeResult = await saveIntakeForm(sessionId, intakeData);
      if (!intakeResult.success) {
        throw new Error("Failed to save intake form");
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
    <main className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          Image Upload {sessionId && `- Session: ${sessionId}`}
        </h1>
        <button
          onClick={handleNewSession}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          New Session
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-600">Loading session images...</div>
        </div>
      ) : (
        <>
          {showIntakeForm && !intakeForm && (
            <div className="mb-8 p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4">
                Training Intake Form
              </h2>
              <form onSubmit={handleIntakeSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2">Sex</label>
                  <select
                    name="sex"
                    required
                    defaultValue="man"
                    className="w-full p-2 border rounded bg-inherit"
                  >
                    <option value="">Select...</option>
                    <option value="man">Man</option>
                    <option value="woman">Woman</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2">Training Goal</label>
                  <select
                    name="trainingGoal"
                    required
                    defaultValue="strength gains"
                    className="w-full p-2 border rounded bg-inherit"
                  >
                    <option value="">Select...</option>
                    <option value="weight loss">Weight Loss</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="body recomposition">
                      Body Recomposition
                    </option>
                    <option value="strength gains">Strength Gains</option>
                    <option value="weight gain">Weight Gain</option>
                    <option value="muscle building">Muscle Building</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2">Days Available Per Week</label>
                  <input
                    type="number"
                    name="daysAvailable"
                    min="1"
                    max="7"
                    defaultValue="4"
                    required
                    className="w-full p-2 border rounded bg-inherit"
                  />
                </div>

                <div>
                  <label className="block mb-2">
                    Training Preferences (select multiple)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "cardio",
                      "resistance",
                      "free weights",
                      "machines",
                      "kettlebell",
                      "running",
                      "plyometrics",
                      "yoga",
                    ].map((pref) => (
                      <label key={pref} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="trainingPreferences"
                          value={pref}
                          defaultChecked={[
                            "free weights",
                            "cardio",
                            "kettlebell",
                          ].includes(pref)}
                          className="form-checkbox bg-inherit"
                        />
                        <span className="capitalize">{pref}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-2">Additional Information</label>
                  <textarea
                    name="additionalInfo"
                    className="w-full p-2 border rounded bg-inherit"
                    rows={3}
                    defaultValue="I travel a lot so will be limited to hotel weight rooms Monday through Thursday. I can do kettlebells and running Friday through Sunday."
                  ></textarea>
                </div>

                <div>
                  <label className="block mb-2">
                    Upload Progress Pictures (Optional)
                  </label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                      ${
                        isDragActive
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300"
                      }`}
                  >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                      <p>Drop the files here ...</p>
                    ) : (
                      <p>
                        Drag 'n' drop some files here, or click to select files
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      (Max 10 images, 5MB each. Accepts JPG, PNG, GIF)
                    </p>
                  </div>
                </div>

                {files.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Selected Files:</h3>
                    {files.map((file, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="border-t pt-4">
                    <label className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        name="consent"
                        required
                        defaultChecked
                        className="mt-1 form-checkbox bg-inherit"
                      />
                      <span className="text-sm">
                        I agree to share my data for the purpose of receiving a
                        training program. I understand that AI-generated
                        recommendations may contain mistakes and that I should
                        consult with my physician before starting any new
                        exercise program. I acknowledge that this is for
                        informational purposes only and does not constitute
                        medical or professional advice.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isUploading}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
                  >
                    {isUploading ? "Submitting..." : "Submit Intake Form"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {intakeForm && (
            <div className="mb-8 p-6 border rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Training Profile</h2>
                <button
                  onClick={() => setShowIntakeForm(true)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  Edit Profile
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <p>
                  <strong>Sex:</strong> {intakeForm.sex}
                </p>
                <p>
                  <strong>Training Goal:</strong> {intakeForm.trainingGoal}
                </p>
                <p>
                  <strong>Days Available:</strong> {intakeForm.daysAvailable}
                </p>
                <p>
                  <strong>Preferences:</strong>{" "}
                  {intakeForm.trainingPreferences.join(", ")}
                </p>
                {intakeForm.additionalInfo && (
                  <p className="col-span-2">
                    <strong>Additional Info:</strong>{" "}
                    {intakeForm.additionalInfo}
                  </p>
                )}
              </div>
            </div>
          )}

          {uploadedImages.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-3">Uploaded Images:</h2>
              <div className="grid grid-cols-1 gap-4">
                {uploadedImages.map((image) => (
                  <div
                    key={image.id}
                    className="border p-4 rounded-lg relative"
                  >
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                      title="Delete image"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <div className="flex items-center gap-4">
                      <img
                        src={image.base64Data}
                        alt={image.fileName}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div>
                        <p>
                          <strong>File Name:</strong> {image.fileName}
                        </p>
                        <p>
                          <strong>Session ID:</strong> {image.sessionId}
                        </p>
                        <p>
                          <strong>Upload Time:</strong>{" "}
                          {new Date(image.createdAt).toLocaleString()}
                        </p>
                        {image.aiDescription && (
                          <p className="mt-2">
                            <strong>AI Description:</strong>{" "}
                            <span className="text-gray-700">
                              {image.aiDescription}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
