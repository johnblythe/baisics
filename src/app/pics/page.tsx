"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import { uploadImages, getSessionImages, deleteImage } from "./actions";
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

  // Add useEffect to handle session initialization and image loading
  useEffect(() => {
    const urlSessionId = searchParams.get("sessionId");
    if (urlSessionId) {
      setSessionId(urlSessionId);
      loadSessionImages(urlSessionId);
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

  // Handle file upload to server
  const uploadFiles = async (filesToUpload: File[]) => {
    setIsUploading(true);
    try {
      const base64Files = await Promise.all(
        filesToUpload.map(async (file) => ({
          fileName: file.name,
          base64Data: await fileToBase64(file),
          sessionId,
        }))
      );

      const result = await uploadImages(base64Files);
      if (result.success) {
        setUploadedImages((prev) => [...prev, ...result.images]);
        if (!searchParams.get("sessionId")) {
          router.push(`/pics?sessionId=${sessionId}`);
        }
      } else {
        // Handle error
        console.error("Upload failed:", result.error);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setFiles((prev) => {
      const newFiles = [...prev, ...acceptedFiles];
      // Limit to 10 files
      return newFiles.slice(0, 10);
    });
  }, []);

  // Add new submit handler
  const handleSubmit = async () => {
    if (files.length === 0) return;
    await uploadFiles(files);
    setFiles([]); // Clear files after successful upload
  };

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
      <h1 className="text-2xl font-bold mb-4">
        Image Upload {sessionId && `- Session: ${sessionId}`}
      </h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-600">Loading session images...</div>
        </div>
      ) : (
        <>
          {/* Add the dropzone UI */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              ${
                isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>Drag 'n' drop some files here, or click to select files</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              (Max 10 images, 5MB each. Accepts JPG, PNG, GIF)
            </p>
          </div>

          {files.length > 0 && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-3">Pending Files:</h2>
              <div className="mb-4">
                {files.map((file, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                ))}
              </div>
              <button
                onClick={handleSubmit}
                disabled={isUploading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {isUploading ? "Uploading..." : "Upload Files"}
              </button>
            </div>
          )}

          {isUploading && (
            <div className="mt-4 text-blue-600">Uploading images...</div>
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
